// Orte für die Auswahl im Formular: Mannheim zuerst, danach alle anderen Orte von A bis Z (ohne Stadtteile).
export function ortsliste(einsatz) {
  const rest = einsatz.orte.filter((g) => g.stufe !== 1 && g.stufe !== 'stadtteile').flatMap((g) => g.orte).sort((a, b) => a.localeCompare(b, 'de'));
  return [einsatz.ort_auswahl.erst, ...rest];
}

// Alle Namen, die als „liegt im Einsatzgebiet“ gelten: die Orte und die Mannheimer Stadtteile
export const akzeptierteOrte = (einsatz) => [...ortsliste(einsatz), ...einsatz.orte.filter((g) => g.stufe === 'stadtteile').flatMap((g) => g.orte)];
