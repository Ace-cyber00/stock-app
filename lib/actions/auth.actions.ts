'use server'

import { headers } from "next/headers"
import { auth } from "../betterAuth/auth"
import { inngest } from "../inngest/client"
import { success } from "better-auth"


export const signUpWithEmail = async({email , password , fullName , country , investmentGoals, preferredIndustry, riskTolerance}:SignUpFormData) => {
    try {
        const response= await auth.api.signUpEmail({
            body:{email , password , name:fullName}

        })

        if(response){
            await inngest.send({
                name:'app/user.created',
                data:{
                    email,
                    name:fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry
                }
            })

            return { success:true , data: response}
        }
        
    } catch (e) {
       console.log('Sign up failes' ,e)
       return { success: false , error: 'Sign up failed'}
        
    }
}
export const signInWithEmail = async({email , password }:SignInFormData) => {
    try {
        const response= await auth.api.signInEmail({
            body:{email , password }

        })

        

            return { success:true , data: response}
        }
        
     
        catch (e) {
       console.log('Sign in failes' ,e)
       return { success: false , error: 'Sign in failed'}
        
    }
}



export const signOut = async() => {

    try {
        await auth.api.signOut({headers:await headers()})
        return {success:true}
    } catch (e) {
    console.log('Sign out failed' , e)
    return {success:false , error:'Sign out failed'}    
    }
    
}