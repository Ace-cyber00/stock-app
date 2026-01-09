"use client";
import React from 'react'
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Chocolate_Classical_Sans } from 'next/font/google';
import { Input } from '../ui/input';


const InputField = ({name,label,placeholder,type = "text",register,error,validation, disabled , value}: FormInputProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>
        {label} 
      </Label>
      <Input 
      type={type}  
      id={name} 
      placeholder={placeholder}
      disabled = {disabled}
      value={value}
      className={cn('form-input ', { 'opacity-50 cursor-not-allowed': disabled})}
      {...register(name,validation)}
      />
      {error && <p className="text-sm text-red-500"></p> }
    </div>
  )
}

export default InputField
