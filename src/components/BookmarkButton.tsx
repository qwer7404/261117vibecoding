interface Props {
  active: boolean;
  onToggle: () => void;
}

export function BookmarkButton({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      className="bookmark-btn"
      aria-pressed={active}
      aria-label={active ? '북마크 해제' : '북마크에 저장'}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {active ? '★' : '☆'}
    </button>
  );
}
