import { FieldError } from "../generated/graphql";

export const mapFieldErrors = (
  errors: FieldError[]
): { [key: string]: string } => {
  return errors.reduce((accumulatedErrorsObj, error) => {
    return {
      ...accumulatedErrorsObj,
      [error.field]: error.message,
    };
  }, {});
};
