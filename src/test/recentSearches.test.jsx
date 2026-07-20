import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, screen, fireEvent, act } from '@testing-library/react';
import { useRecentSearches } from '../hooks/useRecentSearches.js';
import RecentSearches from '../components/RecentSearches.jsx';

beforeEach(() => {
  localStorage.clear();
});

describe('useRecentSearches', () => {
  it('starts with an empty list', () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.searches).toEqual([]);
  });

  it('pushes a search term', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.push('amazon'));
    expect(result.current.searches).toEqual(['amazon']);
  });

  it('deduplicates and moves to front', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.push('amazon'));
    act(() => result.current.push('kenya'));
    act(() => result.current.push('amazon'));
    expect(result.current.searches).toEqual(['amazon', 'kenya']);
  });

  it('trims whitespace and ignores empty terms', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.push('  amazon  '));
    act(() => result.current.push(''));
    act(() => result.current.push('   '));
    expect(result.current.searches).toEqual(['amazon']);
  });

  it('caps at 8 items', () => {
    const { result } = renderHook(() => useRecentSearches());
    for (let i = 0; i < 10; i++) {
      act(() => result.current.push(`term-${i}`));
    }
    expect(result.current.searches).toHaveLength(8);
    expect(result.current.searches[0]).toBe('term-9');
  });

  it('removes a specific term', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.push('amazon'));
    act(() => result.current.push('kenya'));
    act(() => result.current.remove('amazon'));
    expect(result.current.searches).toEqual(['kenya']);
  });

  it('clears all terms', () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.push('amazon'));
    act(() => result.current.push('kenya'));
    act(() => result.current.clear());
    expect(result.current.searches).toEqual([]);
  });

  it('persists to localStorage', () => {
    const { result, unmount } = renderHook(() => useRecentSearches());
    act(() => result.current.push('amazon'));
    unmount();

    const { result: result2 } = renderHook(() => useRecentSearches());
    expect(result2.current.searches).toEqual(['amazon']);
  });
});

describe('RecentSearches component', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(
      <RecentSearches
        searches={['amazon']}
        visible={false}
        onSelect={() => {}}
        onRemove={() => {}}
        onClear={() => {}}
        onClose={() => {}}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when searches is empty', () => {
    const { container } = render(
      <RecentSearches
        searches={[]}
        visible={true}
        onSelect={() => {}}
        onRemove={() => {}}
        onClear={() => {}}
        onClose={() => {}}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders search terms as chips', () => {
    render(
      <RecentSearches
        searches={['amazon', 'kenya']}
        visible={true}
        onSelect={() => {}}
        onRemove={() => {}}
        onClear={() => {}}
        onClose={() => {}}
      />
    );
    expect(screen.getByText('amazon')).toBeTruthy();
    expect(screen.getByText('kenya')).toBeTruthy();
    expect(screen.getByText('Clear')).toBeTruthy();
  });

  it('calls onSelect when a term is clicked', () => {
    const onSelect = vi.fn();
    render(
      <RecentSearches
        searches={['amazon']}
        visible={true}
        onSelect={onSelect}
        onRemove={() => {}}
        onClear={() => {}}
        onClose={() => {}}
      />
    );
    fireEvent.click(screen.getByText('amazon'));
    expect(onSelect).toHaveBeenCalledWith('amazon');
  });

  it('calls onRemove when dismiss button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <RecentSearches
        searches={['amazon']}
        visible={true}
        onSelect={() => {}}
        onRemove={onRemove}
        onClear={() => {}}
        onClose={() => {}}
      />
    );
    const dismiss = screen.getByLabelText('Remove "amazon"');
    fireEvent.click(dismiss);
    expect(onRemove).toHaveBeenCalledWith('amazon');
  });

  it('calls onClear when Clear button is clicked', () => {
    const onClear = vi.fn();
    render(
      <RecentSearches
        searches={['amazon']}
        visible={true}
        onSelect={() => {}}
        onRemove={() => {}}
        onClear={onClear}
        onClose={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalled();
  });

  it('calls onClose when clicking outside', () => {
    const onClose = vi.fn();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <RecentSearches
          searches={['amazon']}
          visible={true}
          onSelect={() => {}}
          onRemove={() => {}}
          onClear={() => {}}
          onClose={onClose}
        />
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(onClose).toHaveBeenCalled();
  });
});
