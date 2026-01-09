"use client";
import {CountrySelectField} from '@/components/forms/CountrySelectField';
import Footer from '@/components/forms/FooterLink';

import InputField from '@/components/forms/InputField';
import SelectFields from '@/components/forms/SelectFields';
import { Button } from '@/components/ui/button';
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from '@/lib/constants';

import { useForm, SubmitHandler } from 'react-hook-form'

const SignUp = () => {
 const {
         register,
         handleSubmit,
         control,
         formState:{errors , isSubmitting},
     
     } = useForm<SignUpFormData>({
        defaultValues: {
        fullName:'',
        email:'',
        password: '',
        country:"US", // Changed from "USA" to "US"
        investmentGoals:'Growth',
        riskTolerance:'Medium',
        preferredIndustry:'Technology'
     }
     })
     const onsubmit: SubmitHandler<SignUpFormData> = async (data) => {
        try {
            console.log(data);
            
        } catch (e) {
            console.log(e);
            
        }
     }

     return (
     <>
       <h1 className='form-title'>Sign Up & Personalize</h1>
       <form onSubmit={handleSubmit(onsubmit)} className='space-y-5'>
        <InputField 
        name = "fullName"
        label = "Full Name"
        placeholder = "Jhon Doe"
        register = {register}
        error = {errors.fullName}
        validation = {{required:'Full name is req', minlength:2}}

        /><InputField 
        name = "email"
        label = "Email"
        placeholder = "contact@jsmastery.com"
        register = {register}
        error = {errors.email}
        validation = {{required:'Email is req', pattern: /^w+@\w+\.\w+$/, message:"Email is required" }}

        />
        
        <InputField 
        name = "password"
        label = "Password"
        placeholder = "Enter a strong password"
        type= "password"
        register = {register}
        error = {errors.password}
        validation = {{required:'Password is req', minlength: 8}}

        />

         <CountrySelectField 
          name="country"
          label="Country"
          control={control}
           error={errors.country}
           required
/>

        <SelectFields 
         name = "investment goals"
         label = "Investment Goals"
         placeholder = "Select your investment goals"
         options = {INVESTMENT_GOALS}
         control ={control}
         error = {errors.investmentGoals}
         required 
        />
        <SelectFields 
         name = "Risk Tolerance"
         label = "Risk Tolerance"
         placeholder = "Select your risk levels"
         options = {RISK_TOLERANCE_OPTIONS}
         control ={control}
         error = {errors.riskTolerance}
         required 
        />
        <SelectFields 
         name = "preferred industry"
         label = "Preferred Industry"
         placeholder = "Select your Preferred Industry"
         options = {PREFERRED_INDUSTRIES}
         control ={control}
         error = {errors.preferredIndustry}
         required 
        />

        <Button type="submit" disabled={isSubmitting} className='yellow-btn w-full mt-5' >
          {isSubmitting ? 'Creating Account' : 'Start Your Investing Journey '}
        </Button>

        <Footer 
        text="Already have an account"
        linkText='Sign in'
        href = '/sign-in'
        />
       </form>
     </>
   )
}

export default SignUp
