import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import AdvancedPagination from './Pagination';
import '@testing-library/jest-native/extend-expect';


const mockOnPageChange = jest.fn();
const DOTS = '...';

const defaultProps = {
  onPageChange: mockOnPageChange,
  currentPage: 1,
  totalPages: 10,
  pageLimit: 5,
};

describe('AdvancedPagination', () => {
  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  test('debe llamar a onPageChange con la página anterior al hacer clic en "<"', () => {
    render(<AdvancedPagination {...defaultProps} currentPage={5} />);
    
    fireEvent.press(screen.getByText('<'));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });

  test('debe llamar a onPageChange con la página siguiente al hacer clic en ">"', () => {
    render(<AdvancedPagination {...defaultProps} currentPage={5} />);
    
    fireEvent.press(screen.getByText('>'));

    expect(mockOnPageChange).toHaveBeenCalledWith(6);
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });

  test('debe deshabilitar el botón Anterior en la primera página (1)', () => {
    render(<AdvancedPagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByText('<');
    expect(prevButton).toBeDisabled();
    
    fireEvent.press(prevButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  test('debe deshabilitar el botón Siguiente en la última página', () => {
    render(<AdvancedPagination {...defaultProps} currentPage={10} totalPages={10} />);

    const nextButton = screen.getByText('>');

    expect(nextButton).toBeDisabled();
    
    fireEvent.press(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  test('la página activa no debe ser clickeable', () => {
    render(<AdvancedPagination {...defaultProps} currentPage={2} totalPages={10} pageLimit={5} />);
    
    const activePageButton = screen.getByText('2').parent as React.ReactElement;
    
    expect(activePageButton).toBeDisabled();

    fireEvent.press(screen.getByText('2'));

    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  const getRenderedRange = () => {
    
    const pageElements = screen.getAllByText(/\d+|\.\.\./).map(node => node.props.children);
    
    return pageElements.filter(t => t !== '<' && t !== '>');
  };

  test('RANGO A: Menos páginas que el límite (Simple)', () => {
    
    render(<AdvancedPagination {...defaultProps} totalPages={4} pageLimit={5} />);

    expect(getRenderedRange()).toEqual([1, 2, 3 , 4]);
    expect(screen.queryByText(DOTS)).toBeNull();
  });
  
  test('RANGO B: Total de páginas exactamente igual al límite', () => {
    
    render(<AdvancedPagination {...defaultProps} currentPage={3} totalPages={5} pageLimit={5} />);
    
    expect(getRenderedRange()).toEqual([1, 2, 3, 4, 5]);
    expect(screen.queryByText(DOTS)).toBeNull();
  });
});