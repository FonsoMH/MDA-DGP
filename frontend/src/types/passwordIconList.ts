import starIcon from '../../assets/PasswordIcons/star.png';
import appleIcon from '../../assets/PasswordIcons/apple.png';
import carIcon from '../../assets/PasswordIcons/car.png';
import dogIcon from '../../assets/PasswordIcons/dog.png';
import houseIcon from '../../assets/PasswordIcons/house.png';
import bookIcon from '../../assets/PasswordIcons/book.png';
import ballIcon from '../../assets/PasswordIcons/ball.png';
import treeIcon from '../../assets/PasswordIcons/tree.png';
import paintIcon from '../../assets/PasswordIcons/paint.png';
import musicIcon from '../../assets/PasswordIcons/music.png';
import unknownIcon from '../../assets/PasswordIcons/unknown.png';

export type Icon = {
  name: string,
  icon: any,
  code?: string
}

export const unknowICon: Icon = { name: 'Unknown', icon: unknownIcon };

const iconList: Icon[] = [
  { name: 'Estrella', icon: starIcon, code: 'ST4R' },
  { name: 'Manzana', icon: appleIcon, code: 'APL3' },
  { name: 'Coche', icon: carIcon, code: 'C4R$' },
  { name: 'Perro', icon: dogIcon, code: 'D0GZ' },
  { name: 'Casa', icon: houseIcon, code: 'H0US' },
  { name: 'Libro', icon: bookIcon, code: 'B00K' },
  { name: 'Pelota', icon: ballIcon, code: 'B4L!' },
  { name: 'Árbol', icon: treeIcon, code: 'TR33' },
  { name: 'Pintura', icon: paintIcon, code: 'PNT1' },
  { name: 'Música', icon: musicIcon, code: 'MUSC' },
];

const iconsMap = Object.values(iconList)
    .map(item => { 
        return { name: item.name, icon: item.icon, code: item.code }; 
    });
export default iconList;
export { iconsMap };