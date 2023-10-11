export function shadeColor(hexColor: string, percent: number) {
  let R = parseInt(hexColor.substring(1, 3), 16);
  let G = parseInt(hexColor.substring(3, 5), 16);
  let B = parseInt(hexColor.substring(5, 7), 16);

  R = Math.round((R * (100 + percent)) / 100);
  G = Math.round((G * (100 + percent)) / 100);
  B = Math.round((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const nextR =
    R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
  const nextG =
    G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
  const nextB =
    B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + nextR + nextG + nextB;
}
