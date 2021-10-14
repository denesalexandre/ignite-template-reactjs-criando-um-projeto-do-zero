import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const dateFormat = (date: string): string => {
    try {
        return format(new Date(date), 'dd MMM yyyy', { locale: ptBR, });
    } catch (e) {
        return date;
    }
};