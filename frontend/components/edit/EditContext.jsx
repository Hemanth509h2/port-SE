'use client';
import { createContext, useContext } from 'react';

// On the public site `editing` is false and every editable primitive renders plain HTML.
// The admin editor provides the full API (update, select, list operations, drag & drop...).
const EditCtx = createContext({ editing: false });

export const EditProvider = EditCtx.Provider;
export const useEdit = () => useContext(EditCtx);
