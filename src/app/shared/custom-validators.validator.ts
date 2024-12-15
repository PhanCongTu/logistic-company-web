import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { AppConstants } from "./constants/app-constants.constant";

export class CustomValidators {

      // Custom validator cho username: ít nhất 4 ký tự
      static usernameValidator(): ValidatorFn {
            return (control: AbstractControl): ValidationErrors | null => {
                  const value = control.value;
                  if (value && (!AppConstants.LOGIN_NAME_REGEX.test(value))) {
                        return { usernameInvalid: { value: value } };
                  }
                  return null;  // Valid nếu không có lỗi
            };
      }

      // Custom validator cho email: ít nhất 4 ký tự
      static emailValidator(): ValidatorFn {
            return (control: AbstractControl): ValidationErrors | null => {
                  const value = control.value;
                  if (value && (!AppConstants.EMAIL_REGEX.test(value))) {
                        return { emailInvalid: { value: value } };
                  }
                  return null;  // Valid nếu không có lỗi
            };
      }

      static phoneNumberValidator(): ValidatorFn {
            return (control: AbstractControl): ValidationErrors | null => {
                  const value = control.value;
                  if (value && (!AppConstants.PHONE_NUMBER_REGEX.test(value))) {
                        return { phoneNumberInvalid: { value: value } };
                  }
                  return null;  // Valid nếu không có lỗi
            };
      }

      // Custom validator cho password: ít nhất 8 ký tự, bao gồm chữ và số
      static passwordValidator(): ValidatorFn {
            return (control: AbstractControl): ValidationErrors | null => {
                  const value = control.value;
                  if (value && (!AppConstants.PASSWORD_REGEX.test(value))) {
                        return { passwordInvalid: true };
                  }
                  return null;  // Valid nếu không có lỗi
            };
      }
}
