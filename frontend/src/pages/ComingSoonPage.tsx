interface Props {
  title: string
}

/** Placeholder for a game that hasn't been built yet. */
export function ComingSoonPage({ title }: Props) {
  return (
    <section className="coming-soon">
      <h1>{title}</h1>
      <p>This game is coming soon.</p>
    </section>
  )
}
