import { ValidatorFn, AbstractControl, ValidationErrors, FormGroupDirective, NgForm } from '@angular/forms'
import { ErrorStateMatcher } from '@angular/material/core'

export const confirmPasswordValidator: ValidatorFn = (
  formGroupControl: AbstractControl<{ password: string; confirmPassword: string }>
): ValidationErrors | null => {
  const password = formGroupControl.value.password
  const confirmPassword = formGroupControl.value.confirmPassword
  console.log('#const')
  console.log(password)
  console.log(confirmPassword)
  return password !== confirmPassword ? { confirmPasswordError: true } : null
}

export class PasswordStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl, form: FormGroupDirective | NgForm): boolean {
    if (!control || !control.parent) {
      return false
    }
    return control.parent.hasError('confirmPasswordError')
  }
}
