import * as yup from 'yup';

export const createCampusSchema = yup.object({
  campus_name: yup.string()
    .min(4, "Campus name must contain at least 4 characters.")
    .required("Campus name is required."),
  
  email: yup.string()
    .email("Please enter a valide email.")
    .required("Manager Email is required."),
  
  manager_name: yup.string()
    .min(6, "Manager name must be at least 6 characters long.")
    .required("Manager name is required."),

  password: yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .required("Password is required.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one number, one uppercase and lowercase letter.'
    ),

  confirm_password: yup.string()
    .oneOf([yup.ref('password')], "Confirm password must Match with Password.")
    .required("Confirm password is required."),
});