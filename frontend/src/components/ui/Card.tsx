import { Card as MuiCard, CardContent, CardProps as MuiCardProps } from '@mui/material';
import type { ReactNode } from 'react';

export interface CardProps extends MuiCardProps {
  children: ReactNode;
  padding?: boolean;
}

export const Card = ({ children, padding = true, ...props }: CardProps) => {
  return (
    <MuiCard {...props}>
      {padding ? (
        <CardContent>
          {children}
        </CardContent>
      ) : (
        children
      )}
    </MuiCard>
  );
};
