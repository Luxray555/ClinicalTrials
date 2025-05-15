import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidOrNotSet(
    options: {
        type: 'enum' | 'number' | 'string',
        enumObject?: object
    },
    validationOptions?: ValidationOptions
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidOrNotSet',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [options],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (value === undefined || value === 'not set') return true;

                    const { type, enumObject } = args.constraints[0];

                    if (type === 'enum' && enumObject) {
                        return Object.values(enumObject).includes(value);
                    }

                    if (type === 'number') {
                        return typeof +value === 'number' && !isNaN(value);
                    }

                    if (type === 'string') {
                        return typeof value === 'string';
                    }

                    return false;
                },
            },
        });
    };
}
