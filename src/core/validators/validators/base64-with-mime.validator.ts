import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'Base64WithMime', async: false })
export class Base64WithMimeValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const regex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/;
    return regex.test(value);
  }

  defaultMessage(): string {
    return 'The string must be a valid Base64-encoded image with a MIME type.';
  }
}