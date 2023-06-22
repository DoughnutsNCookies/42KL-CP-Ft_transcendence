import React, { useEffect, useRef, useState } from 'react'
import { checkTFA } from '../../api/tfaAPI';
import { set } from 'lodash';

interface UserFormTfaProps {
  tfaCode: string;
  setTfaCode: React.Dispatch<React.SetStateAction<string>>;
  tfaVerified: boolean;
  setTFAVerified: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  invert?: boolean;
}

function UserFormTFAStatus(props: { tfaVerified: boolean }) {

  // Props
  const { tfaVerified } = props;

  if (tfaVerified) return (<p className='px-3 py-1 bg-accGreen text-highlight'>SUCCESS!</p>);
  return (<p className='px-3 py-1 bg-accRed text-highlight'>FAILED!</p>);
}

function UserFormTfa(props: UserFormTfaProps) {

  // Props
  const { tfaCode, setTfaCode, tfaVerified, setTFAVerified, handleSubmit, invert = false } = props;

  // Hooks
  const tfaCodeInputRef = useRef<HTMLInputElement>(null);
  const [currentDigit, setCurrentDigit] = useState<number>(0);
  const [hasResult, setHasResult] = useState<boolean>(false);

  useEffect(() => {
    tfaCodeInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (tfaCode.length === 0) {
      setCurrentDigit(0);
      return;
    }
    setCurrentDigit(tfaCode.length - 1);

    if (tfaCode.length === 6) {
      verifyTfaCode();
    }
  }, [tfaCode]);

  useEffect(() => {
    if (!tfaVerified) {
      setTimeout(() => {
        setTfaCode('');
      }, 500);
      tfaCodeInputRef.current?.focus();
    }
    if (tfaVerified) {
      handleSubmit();
    }
  }, [tfaVerified]);

  return (
    <div className='animate-pulse-short'>
      <div className='flex flex-col cursor-pointer gap-y-2' onClick={() => tfaCodeInputRef.current?.focus()}>
        <p className={`w-full ${invert && 'text-highlight'}`}>2FA Verification</p>
        <p className='text-sm font-normal text-highlight/80'>Hold on! We need to verify your 2FA code before we proceed.</p>
        <div className='flex flex-row items-center gap-x-3 h-fit'>
          <div className='flex flex-row text-2xl gap-x-1 w-fit'>
            {showTypedCode()}
          </div>
          {hasResult && <UserFormTFAStatus tfaVerified={tfaVerified} />}
        </div>
      </div>
      <input
        onKeyDown={handleKeyPress}
        onChange={handleOnchange}
        value={tfaCode}
        className='w-0 h-0'
        type="text"
        ref={tfaCodeInputRef}
        disabled={tfaVerified}
      />
    </div>
  )

  function showTypedCode() {
    const code = [];
    const currentTfaLength = tfaCode.length;

    for (let i = 0; i < 6; i++) {
      if (i < currentTfaLength) {
        code.push(
          <div key={i} className={`text-dimshadow bg-highlight rounded-sm aspect-square w-8 px-1 py-0.5 border border-highlight text-center`}>
            {tfaCode[i]}
          </div>
        );
      } else {
        code.push(
          <div key={i} className={`text-highlight bg-highlight rounded-sm aspect-square w-8 px-1 py-0.5 border ${i === currentTfaLength && 'border-dimshadow animate-pulse'} text-center`}>
            0
          </div>
        )
      }
    }
    return code;
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && tfaCode.length === 6) {
      e.preventDefault();
      setTfaCode(tfaCode.slice(0, -1));
    }
  }

  function handleOnchange(e: React.ChangeEvent<HTMLInputElement>) {

    if (hasResult) setHasResult(false);

    if (tfaCode.length >= 6) return;

    // check if the value only contains numbers
    if (e.target.value.match(/^[0-9]*$/)) {
      setTfaCode(e.target.value);
    }
  }

  async function verifyTfaCode() {
    const result = await checkTFA(tfaCode);
    setTFAVerified(result.success);
    if (!result.success) setTfaCode('');
    if (!hasResult) setHasResult(true);
  }
}

export default UserFormTfa