import * as Yup from 'yup';

export const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('L\'ancien mot de passe est requis'),
  newPassword: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[a-z]/, 'Doit contenir au moins une minuscule')
    .matches(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .matches(/[0-9]/, 'Doit contenir au moins un chiffre')
    .required('Le nouveau mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe ne correspondent pas')
    .required('La confirmation est requise'),
});