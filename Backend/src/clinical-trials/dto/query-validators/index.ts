import { Transform } from 'class-transformer';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          // Ensure the value matches the yyyy-mm-dd format
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          // Split the string into year, month, and day
          const [year, month, day] = value.split('-').map(Number);

          // Validate logical ranges
          if (year < 1000 || year > 9999) return false; // Valid year
          if (month < 1 || month > 12) return false; // Valid month

          // Get the maximum days in the given month and year
          const maxDays = new Date(year, month, 0).getDate();
          return day >= 1 && day <= maxDays; // Valid day
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date in the format yyyy-mm-dd`;
        },
      },
    });
  };
}

export function TransformToArray() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',');
    }
    return [];
  });
}
