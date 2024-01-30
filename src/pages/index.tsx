import React, { useState } from 'react';
import { z } from 'zod';

const combinedFormSchema = z.object({
  name: z.string().min(1, 'Nome é necessário'),
  contactType: z.enum(['Email','Celular'],'Selecione um método de contato'),
  contact: z.string().nonempty('O campo de contato é necessário').refine((data, context) =>{
    if (context.parent.contactType === 'Email') {
      return z.string().email().safeParse(data).success;
    }
    if (context.parent.contactType === 'Celular') {
      return z.string().regex(/^\d+$/, 'Somente números são permitidos').safeParse(data).success;
    }
    return false;
   }, 'Dados de contato inválidos'),
    personType: z.enum(['Física','Jurídica'], 'Selecione o tipo de pessoa'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
 });

const InputField = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
}) => (
  <>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm p-2 w-full ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="text-red-500 text-xs italic">{error}</p>}
  </>
);

const SelectField = ({
  name,
  options,
  prompt,
  value,
  onChange,
}) => (
  <>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm p-2 w-full"
    >
      <option value="">{prompt}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </>
);

const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactType: '',
    contact:'',
    personType:'',
    password: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleContactTypeChange = (event) => {
    const {name, value} = event.target;
    setFormData({...formData, [name]: value,contact:''});
    setErrors({...errors,contact: undefined});
  }
    
   const handleNumericInputChange =(event) => {
    const { name, value} = event.target;
    const onlyNums = value.replace(/[^0-9]/g,'');
    setFormData({...formData, [name]: onlyNums});
   } 

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setErrors({...errors, [name]: undefined});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submit button clicked with formData:', formData);
    setErrors({});
    

    try {
      combinedFormSchema.parse(formData);
      console.log('Form validation successful.');
      setIsSubmitted(true);
      console.log('isSubmitted set to true');
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Form of validation failed:', error.flatten().fieldErrors);
        setErrors(error.flatten().fieldErrors);
      } else {
        console.error('Unexpected error during form submission', error);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">Sucesso!</h3>
          <p>Obrigado por se inscrever, {formData.name}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4 p-6 bg-white rounded-lg shadow-md">
        <InputField
          type="text"
          name="name"
          placeholder="Nome Completo"
          value={formData.name}
          onChange={handleChange}
          error={errors.name} 
        />
        <SelectField
          name="contactType"
          prompt="Contato"
          options={['Email','Celular']}
          value={formData.contactType}
          onChange={handleContactTypeChange}
        />
       {formData.contactType === 'Email' && ( 
        <InputField
          type="email"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          error={errors.email}
        />
       )}
       {formData.contactType === 'Celular' &&(
        <InputField
          type="tel"
          name="contact"
          value={formData.contact}
          onChange={handleNumericInputChange}
          error={errors.contact?.[0]}
          pattern="\d*"
        />
       )} 
        <SelectField
          name="personType"
          options={['Física','Jurídica']}
          value={formData.personType}
          prompt={"Tipo de pessoa"}
          onChange={handleChange}
        />
        <InputField
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          error={errors.password?.[0]}

        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Inscrever-se
        </button>
      </form>
    </div>
  );
};


export default MyForm;