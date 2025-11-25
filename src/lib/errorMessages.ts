export const PLAYBACK_ERRORS = {
  GEO_BLOCKED: "Reproducción bloqueada. El servicio StreemingTv solo está disponible en Perú.",
  CONCURRENT_LIMIT_REACHED: "Límite de reproducción simultánea alcanzado.",
  PLAN_UPGRADE_REQUIRED: "Necesitas actualizar tu plan para acceder a este contenido.",
  NO_SUBSCRIPTION: "No tienes una suscripción activa."
};

export const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'Email not confirmed': 'Por favor confirma tu email antes de iniciar sesión',
  'User already registered': 'Este email ya está registrado',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres'
};

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) {
    return AUTH_ERRORS[error.message] || error.message;
  }
  return 'Ha ocurrido un error. Por favor intenta de nuevo.';
}
