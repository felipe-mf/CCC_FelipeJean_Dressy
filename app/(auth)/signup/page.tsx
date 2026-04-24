"use client";

import { signUp } from "@/lib/auth/actions";
import { useState } from "react";
import Link from "next/link";

export default function CadastroPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await signUp(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
          Criar conta
        </h1>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nome completo
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tipo de conta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 border border-neutral-300 rounded-lg p-3 cursor-pointer has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  defaultChecked
                  className="accent-neutral-900"
                />
                <span className="text-sm">Compradora</span>
              </label>
              <label className="flex items-center gap-2 border border-neutral-300 rounded-lg p-3 cursor-pointer has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50">
                <input
                  type="radio"
                  name="role"
                  value="merchant"
                  className="accent-neutral-900"
                />
                <span className="text-sm">Lojista</span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full bg-neutral-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-4 text-sm text-neutral-500 text-center">
          Já tem conta?{" "}
          <Link
            href="/auth/login"
            className="text-neutral-900 font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
