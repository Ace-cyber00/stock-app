import React from 'react'
import { Label } from '../ui/label'
import { Controller } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SelectFields = ({name , label , placeholder , options , control , error , required = false}: SelectFieldProps ) => {
  return (
    <div className='space-y-2'>
        <Label htmlFor={name} className='form-label'>{label}</Label>

        <Controller 
        name ={name}
        control = {control}
        rules = {{required: required ? `Please select ${label.toLowerCase()}`: false, 
      }}
        render={({field}) => (
        <Select value={field.value} onValueChange={field.onChange} >
          <SelectTrigger className="select-trigger">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          
          <SelectContent  className='bg-gray-800 border-gray-600 text-white'>
            {options.map((options) => (
              <SelectItem value={options.value} key={options.value}  className='data-[highlighted]:bg-gray-700 data-[highlighted]:text-white hover:bg-gray-700 hover:text-white cursor-pointer'>
                {options.label}
              </SelectItem>

            ))}
          </SelectContent>
          {error && <p className='text-sm text-red-500'>{error.message}</p>}
        </Select>
        )}
        />
      
    </div>
  )
}

export default SelectFields
