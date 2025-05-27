import { TextStyle } from 'react-native';

export const getFontFamily = (weight?: string): string => {
  switch (weight) {
    case '100':
    case 'thin':
      return 'Inter-Thin';
    case '200':
    case 'extralight':
      return 'Inter-ExtraLight';
    case '300':
    case 'light':
      return 'Inter-Light';
    case '400':
    case 'normal':
    case 'regular':
      return 'Inter-Regular';
    case '500':
    case 'medium':
      return 'Inter-Medium';
    case '600':
    case 'semibold':
      return 'Inter-SemiBold';
    case '700':
    case 'bold':
      return 'Inter-Bold';
    case '800':
    case 'extrabold':
      return 'Inter-ExtraBold';
    case '900':
    case 'black':
      return 'Inter-Black';
    default:
      return 'Inter-Regular';
  }
};

export const getFontStyle = (weight?: string): TextStyle => ({
  fontFamily: getFontFamily(weight),
}); 