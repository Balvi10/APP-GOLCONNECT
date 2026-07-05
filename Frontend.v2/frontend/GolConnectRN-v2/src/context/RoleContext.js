import React, { createContext, useContext, useState } from 'react';

/**
 * Reemplaza el `userRole` que en el web vivía en App.jsx.
 * Guarda el rol elegido en la Landing ('jugador' | 'reclutador')
 * y lo expone a cualquier pantalla.
 */
const RoleContext = createContext({ role: null, setRole: () => {} });

export function RoleProvider({ children }) {
  const [role, setRole] = useState(null);
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

export default RoleContext;
