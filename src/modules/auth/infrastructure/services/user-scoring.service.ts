import { Injectable } from '@nestjs/common';

export interface UserSignals {
  emailVerified: boolean;
  phoneVerified: boolean;
  profileCompletionRatio: number;   // 0..1
  skillsCount: number;
  skillsGlobalScore: number;       // 0..100
  resumeParsedAt?: Date;           // activité
}

export interface UserScoreResult {
  score: number;
  components: {
    emailVerified: number;
    phoneVerified: number;
    profileCompletion: number;
    skills: number;
    activity: number;
    weights: {
      email: number;
      phone: number;
      profile: number;
      skills: number;
      activity: number;
    };
  };
}

@Injectable()
export class UserScoringService {
  private readonly wEmail = 0.2;      // poids email vérifié
  private readonly wPhone = 0.2;      // poids téléphone vérifié
  private readonly wProfile = 0.2;    // poids complétion profil
  private readonly wSkills = 0.3;     // poids compétences
  private readonly wActivity = 0.1;   // poids activité

  private readonly halfLifeDays = 30; // demi-vie de l'activité en jours
  private readonly skillsCountCap = 20; // cap pour le nombre de compétences

  private normalizeWeights(): [number, number, number, number, number] {
    const s = this.wEmail + this.wPhone + this.wProfile + this.wSkills + this.wActivity;
    if (s <= 0) {
      return [0.2, 0.2, 0.2, 0.2, 0.2];
    }
    return [
      this.wEmail / s,
      this.wPhone / s,
      this.wProfile / s,
      this.wSkills / s,
      this.wActivity / s,
    ];
  }

  private activityFactor(parsedAt?: Date): number {
    if (!parsedAt) {
      return 0.0;
    }
    const days = Math.max(0.0, (Date.now() - parsedAt.getTime()) / (1000 * 60 * 60 * 24));
    return Math.pow(0.5, days / Math.max(1.0, this.halfLifeDays)); // ∈ (0,1]
  }

  private skillsComponent(count: number, globalScore: number): number {
    const cov = Math.min(1.0, Math.max(0.0, count) / Math.max(1, this.skillsCountCap));
    const qual = Math.max(0.0, Math.min(100.0, globalScore)) / 100.0;
    return 100.0 * (0.5 * cov + 0.5 * qual);
  }

  compute(signals: UserSignals): UserScoreResult {
    const [wEmail, wPhone, wProfile, wSkills, wActivity] = this.normalizeWeights();

    const emailC = signals.emailVerified ? 100.0 : 0.0;
    const phoneC = signals.phoneVerified ? 100.0 : 0.0;
    const profileC = 100.0 * Math.max(0.0, Math.min(1.0, signals.profileCompletionRatio));
    const skillsC = this.skillsComponent(signals.skillsCount, signals.skillsGlobalScore);
    const actC = 100.0 * this.activityFactor(signals.resumeParsedAt);

    const final = (
      wEmail * emailC +
      wPhone * phoneC +
      wProfile * profileC +
      wSkills * skillsC +
      wActivity * actC
    );

    return {
      score: Math.round(Math.max(0.0, Math.min(100.0, final))),
      components: {
        emailVerified: Math.round(emailC * 10) / 10,
        phoneVerified: Math.round(phoneC * 10) / 10,
        profileCompletion: Math.round(profileC * 10) / 10,
        skills: Math.round(skillsC * 10) / 10,
        activity: Math.round(actC * 10) / 10,
        weights: {
          email: wEmail,
          phone: wPhone,
          profile: wProfile,
          skills: wSkills,
          activity: wActivity,
        },
      },
    };
  }

  calculateProfileCompletionRatio(user: {
    fullname?: string;
    email?: string;
    phone?: string;
    poste?: string;
    avatarUrl?: string;
  }): number {
    let completed = 0;
    let total = 5;

    if (user.fullname && user.fullname.trim()) completed++;
    if (user.email && user.email.trim()) completed++;
    if (user.phone && user.phone.trim()) completed++;
    if (user.poste && user.poste.trim()) completed++;
    if (user.avatarUrl && user.avatarUrl.trim()) completed++;

    return completed / total;
  }
}
