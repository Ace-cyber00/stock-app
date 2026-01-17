'use server'

import { headers } from "next/headers"
import { auth } from "../betterAuth/auth"
import { inngest } from "../inngest/client"
import { success } from "better-auth"


export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, preferredIndustry, riskTolerance }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({
            body: { email, password, name: fullName },
            headers: await headers()
        })

        if (response) {
            // Try to send Inngest event, but don't fail signup if it errors
            try {
                await inngest.send({
                    name: 'app/user.created',
                    data: {
                        email,
                        name: fullName,
                        country,
                        investmentGoals,
                        riskTolerance,
                        preferredIndustry
                    }
                })
            } catch (inngestError) {
                console.log('Inngest event failed (non-critical):', inngestError)
            }

            return { success: true, data: response }
        }

        console.log('Sign up failed: No response from auth API')
        return { success: false, error: 'Sign up failed: No response from server' }

    } catch (e: any) {
        console.log('Sign up failed', e)

        // Check if error is due to duplicate email
        const errorMessage = e?.message || e?.toString() || ''
        if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('unique')) {
            return { success: false, error: 'User already exists' }
        }

        return { success: false, error: 'Sign up failed' }

    }
}
export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({
            body: { email, password },
            headers: await headers()
        })

        return { success: true, data: response }
    } catch (e: any) {
        console.log('Sign in failed', e)

        // Check error message for specific cases
        const errorMessage = e?.message || e?.toString() || ''

        if (errorMessage.toLowerCase().includes('user not found') ||
            errorMessage.toLowerCase().includes('no user') ||
            errorMessage.toLowerCase().includes('does not exist')) {
            return { success: false, error: 'User does not exist' }
        }

        if (errorMessage.toLowerCase().includes('password') ||
            errorMessage.toLowerCase().includes('invalid credentials')) {
            return { success: false, error: 'Invalid email or password' }
        }

        return { success: false, error: 'Sign in failed' }
    }
}



export const signOut = async () => {

    try {
        await auth.api.signOut({ headers: await headers() })
        return { success: true }
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }

}