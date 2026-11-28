'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { updatePasswordAction } from '@/actions/auth.actions'
import { AuthSplitContainer } from '@/components/auth/AuthSplitContainer'
import { Eye, EyeOff } from 'lucide-react'

function UpdatePasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!token) {
    return (
      <div className="bg-[#1e2536] border border-red-500/20 p-6 rounded-[1.125rem] text-center space-y-4">
        <p className="text-slate-300 text-sm font-medium">
          El enlace de recuperación no es válido o está incompleto. Por favor solicita un nuevo enlace desde tu correo.
        </p>
        <Link
          href="/forgot-password"
          className="block w-full py-3 mt-4 bg-[#818cf8] hover:bg-[#6366f1] text-[#111827] rounded-[1rem] font-bold text-[14px] transition-all"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const password = (formData.get('password') as string) || ''
    const confirmPassword = (formData.get('confirm_password') as string) || ''

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    formData.set('token', token)
    const result = await updatePasswordAction(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20">
          {error}
        </div>
      )}

      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5 flex flex-col">
        <label htmlFor="update-password" className="text-[13px] italic text-slate-400">
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            id="update-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            minLength={6}
            required
            className="w-full px-4 py-3.5 pr-12 rounded-[1.125rem] bg-[#1e2536] border-none text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium tracking-widest placeholder:tracking-normal placeholder:text-slate-500"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5 flex flex-col">
        <label htmlFor="update-confirm-password" className="text-[13px] italic text-slate-400">
          Confirmar nueva contraseña
        </label>
        <div className="relative">
          <input
            id="update-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirm_password"
            minLength={6}
            required
            className="w-full px-4 py-3.5 pr-12 rounded-[1.125rem] bg-[#1e2536] border-none text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium tracking-widest placeholder:tracking-normal placeholder:text-slate-500"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 pt-4 bg-[#818cf8] hover:bg-[#6366f1] text-[#111827] rounded-[1.125rem] font-bold text-[15px] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {loading ? 'Actualizando...' : 'Restablecer contraseña'}
      </button>

      <p className="text-center text-[14px] text-slate-400 pt-4">
        <Link href="/login" className="text-pink-400 font-semibold hover:text-pink-300 transition-colors">
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  )
}

export default function UpdatePasswordPage() {
  return (
    <AuthSplitContainer
      title="Nueva etapa,<br/>nueva contraseña"
      subtitle="El cambio es la única constante. Tu evolución comienza con la seguridad de tu espacio personal."
    >
      <div className="flex flex-col w-full max-w-sm mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">
          Nueva contraseña
        </h2>

        <Suspense fallback={<div className="text-slate-400 text-sm">Cargando formulario...</div>}>
          <UpdatePasswordForm />
        </Suspense>
      </div>
    </AuthSplitContainer>
  )
}
