import React, { useState } from 'react'

interface FormQuestionProps {
  question: string;
  answer: string;
  updateAnswer: (ans: string) => void;
  animate: boolean;
}

function UserFormQuestion(props: FormQuestionProps) {
  const { animate } = props;

  const [ans, setAns] = useState(props.answer);

  return (
    <div className='flex flex-col gap-2'>
      <p className={`${animate ? "" : "opacity-0"} transition-opacity duration-500 font-semibold text-lg lg:text-xl`}>{props.question}</p>
      <textarea
        rows={3}
        className={`${animate ? "" : " scale-y-0 -translate-y-1/2"} transition-transform duration-700 [resize:none] bg-dimshadow border-highlight border-2 lg:border-4 rounded-md font-semibold text-xs sm:text-sm md:text-lg lg:text-xl p-2 lg:p-3 w-full focus:[outline:none] focus:animate-pulse-short`}
        value={ans}
        autoComplete='off'
        onChange={handleChange}
      >
      </textarea>
    </div>
  )

  function handleChange(e: React.FormEvent<HTMLTextAreaElement>) {
    setAns(e.currentTarget.value);
    props.updateAnswer(e.currentTarget.value);
  }
}

export default UserFormQuestion