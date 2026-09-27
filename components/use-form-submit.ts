"use client";

import { useTransition, type FormEvent } from "react";

// React 19의 <form action>은 제출 후 입력을 초기화한다. 검증 실패 시 사용자가 쓴 글이
// 사라지지 않도록 onSubmit에서 직접 액션을 디스패치한다.
export function useFormSubmit(dispatch: (form: FormData) => void) {
  const [, startTransition] = useTransition();
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(() => dispatch(form));
  };
}
