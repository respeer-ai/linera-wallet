export const validatePassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 20) {
    return false
  }

  const reg1 = /^[A-Za-z0-9!@#$%^&*()_+]+$/
  if (!reg1.test(password)) {
    return false
  }

  const reg2 = /[A-Za-z]+/
  if (!reg2.test(password)) {
    return false
  }

  const reg3 = /[0-9]+/
  if (!reg3.test(password)) {
    return false
  }

  /*
  const reg4 = /[!@#$%^&*()_+]+/
  if (!reg4.test(password)) {
    return false
  }
  */

  return true
}
