<script lang="ts">
  let { score = 0, label = '', size = 96 } = $props();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = $derived(circumference - (score / 100) * circumference);
  const color = $derived(
    score >= 90 ? '#22c55e' : score >= 50 ? '#eab308' : score >= 25 ? '#f97316' : '#ef4444'
  );
</script>

<div class="flex flex-col items-center gap-1" style="width: {size}px;">
  <svg width={size} height={size} class="transform -rotate-90" aria-hidden="true">
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke="#e5e7eb"
      stroke-width="8"
    />
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width="8"
      stroke-dasharray={circumference}
      stroke-dashoffset={strokeDashoffset}
      stroke-linecap="round"
      class="transition-all duration-500"
    />
    <text
      x={size / 2}
      y={size / 2}
      text-anchor="middle"
      dominant-baseline="central"
      transform="rotate(90, {size / 2}, {size / 2})"
      style="fill: {color}; font-size: 1.25rem; font-weight: 700; font-family: system-ui, sans-serif;"
    >{score}</text>
  </svg>
  <span class="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
</div>
