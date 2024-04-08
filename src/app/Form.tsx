"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Form() {
   const [loading, setLoading] = useState<boolean>(false);
   const [url, setUrl] = useState<string>("");

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (files && files.length) {
         setUrl(URL.createObjectURL(files[0]));
      }
   };

   const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);

      const file = e.currentTarget.file.files[0];
      formData.append("file", file);

      setLoading(true);

      try {
         const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
         });

         if (response.ok) {
            const data = await response.json();
            console.log(data);
            toast.success("File uploaded successfully.");
         } else {
            const err = await response.json();
            toast.error(err.message);
         }
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (loading) {
         document.body.style.overflow = "hidden";
      }
      return () => {
         document.body.style.overflow = "auto";
      };
   }, [loading]);

   return (
      <>
         {loading && (
            <div className='fixed z-50 inset-0 bg-black/20 flex items-center justify-center'>
               <div className='w-12 border-black aspect-square animate-spin rounded-full border-2 border-t-transparent'></div>
            </div>
         )}
         <form onSubmit={onSubmit} className='flex flex-col gap-2 p-4 max-w-md w-full'>
            <div className='w-full border border-black/50 aspect-video border-dashed rounded relative overflow-hidden'>
               <input
                  accept='image/*'
                  onInput={handleChange}
                  className='cursor-pointer appearance-none w-full h-full opacity-0'
                  type='file'
                  name='file'
               />
               <div className='absolute p-2 z-10 inset-0 pointer-events-none flex items-center justify-center'>
                  {url.length ? (
                     <Image
                        className='w-full h-full object-cover rounded'
                        src={url}
                        width={300}
                        height={100}
                        alt=''
                     />
                  ) : (
                     <span>Drag File.</span>
                  )}
               </div>
            </div>
            <button
               className='bg-black p-2 rounded text-white hover:bg-black/90 transition-colors'
               type='submit'>
               Submit
            </button>
         </form>
      </>
   );
}
