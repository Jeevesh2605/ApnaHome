export default function ScoreBadge({ score, isFallback }) {
  if (score === null || score === undefined) return null

  let cls, label
  if (score >= 80)      { cls = 'badge-green';  label = 'Great Match' }
  else if (score >= 50) { cls = 'badge-yellow'; label = 'Good Match' }
  else                  { cls = 'badge-red';    label = 'Poor Match' }

  return (
    <span className={`${cls} font-semibold`}>
      {score}% · {label}
      {isFallback && <span className="text-xs font-normal opacity-70 ml-1">(est.)</span>}
    </span>
  )
}
