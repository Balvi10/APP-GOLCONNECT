import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Rol } from '../types';

interface RoleContextValue {
  role: Rol | null;
  setRole: (role: Rol | null) => void;
}


const RoleContext = createContext<RoleContextValue>({ role: null, setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Rol | null>(null);
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}

export default RoleContext;
