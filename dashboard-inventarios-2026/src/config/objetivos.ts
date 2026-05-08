import type { InventarioRow } from '../types/inventarios';

export interface ObjetivoEsperado {
  task_type: string;
  activity: string;
  objetivo: number;
}

export const OBJETIVOS_ESPERADOS: ObjetivoEsperado[] = [
  {
    task_type: 'regular_search',
    activity: '1P - new_selection',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: '1P - new_selection',
    objetivo: 600,
  },
  {
    task_type: 'reverse_search',
    activity: '1P - catalog_assesment',
    objetivo: 225,
  },
  {
    task_type: 'regular_search',
    activity: '1P - priority',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: '1P - priority',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: '1P - HCI',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: '1P - Derivaciones',
    objetivo: 600,
  },
  {
    task_type: 'delete',
    activity: '3P - hound_comercial',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: '3P - hound_comercial',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: '3P - priority',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: '3P - priority',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: '3P - priority',
    objetivo: 600,
  },
  {
    task_type: 'extraction',
    activity: 'ML - fine_tunning',
    objetivo: 400,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T1 - priority',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: 'CBT_T1 - priority',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'CBT_T1 - priority',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T1 - M4',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: 'CBT_T1 - M4',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'CBT_T1 - M4',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'CBT_T1 - M6',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T1 - M6',
    objetivo: 450,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T3 - priority',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'CBT_T3 - priority',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T5 - priority',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: 'CBT_T5 - priority',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'CBT_T5 - priority',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T5 - matches_MCO_BPC',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'CBT_T5 - matches_MCO_BPC',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T5 - magnakom_catalog_list',
    objetivo: 450,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T5 - UPC',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'DS - expansion_ups',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'DS - expansion_ups',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'DS - M4',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'DS - M4',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: 'DS - M4',
    objetivo: 450,
  },
  {
    task_type: 'extraction',
    activity: 'DS - soft_match',
    objetivo: 600,
  },
  {
    task_type: 'extraction',
    activity: 'DS - data_extraction',
    objetivo: 300,
  },
  {
    task_type: 'regular_search',
    activity: 'DS - M6',
    objetivo: 450,
  },
  {
    task_type: 'regular_search',
    activity: 'fashion - priority',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: 'fashion - priority',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'fashion - priority',
    objetivo: 600,
  },
  {
    task_type: 'extraction',
    activity: 'ML - brand_label',
    objetivo: 200,
  },
  {
    task_type: 'tag',
    activity: 'MP - Quality_model',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'MP - quality_comp_meli',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'MP - quality_meli_meli',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'MP - Quality_interno',
    objetivo: 600,
  },
  {
    task_type: 'deep',
    activity: 'scraping - tiendas_oficiales',
    objetivo: 300,
  },
  {
    task_type: 'deep',
    activity: 'scraping - dominios_temu',
    objetivo: 30,
  },
  {
    task_type: 'deep',
    activity: 'scraping - KSI_shopee',
    objetivo: 1000,
  },
  {
    task_type: 'deep',
    activity: 'scraping - hero_items_temu',
    objetivo: 200,
  },
  {
    task_type: 'deep',
    activity: 'scraping - CBT Matching Backlog',
    objetivo: 400,
  },
  {
    task_type: 'deep',
    activity: 'selection - BIC_manuales',
    objetivo: 150,
  },
  {
    task_type: 'reverse_search',
    activity: 'selection - BIC_manuales',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'selection - BIC_manuales',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'selection - Plataforma',
    objetivo: 600,
  },
  {
    task_type: 'reverse_search',
    activity: 'selection - KSI',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: 'selection - KSI',
    objetivo: 600,
  },
  {
    task_type: 'deep',
    activity: 'shipping - shopee',
    objetivo: 900,
  },
  {
    task_type: 'deep',
    activity: 'shipping - shein',
    objetivo: 160,
  },
  {
    task_type: 'deep',
    activity: 'shipping - temu',
    objetivo: 160,
  },
  {
    task_type: 'extraction',
    activity: 'taggueador - maria',
    objetivo: 1265,
  },
  {
    task_type: 'extraction',
    activity: 'taggueador - validaciones',
    objetivo: 1265,
  },
  {
    task_type: 'extraction',
    activity: 'taggueador - vecinos',
    objetivo: 1265,
  },
  {
    task_type: 'deep',
    activity: 'scraping - manual_price_temu',
    objetivo: 1000,
  },
  {
    task_type: 'reverse_search',
    activity: '3P - sample_not_found',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: '3P - sample_not_found',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'MP - quality_w&s_1P',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: 'CBT_T5 - matches_MLA_BPC',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: '1P_ semiautomatico',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'Verificacion_Seller',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: 'CBT_T5 - matches_MLA_BPC',
    objetivo: 600,
  },
  {
    task_type: 'deep',
    activity: 'CBT_T3 - Shipping _Amazon',
    objetivo: 600,
  },
  {
    task_type: 'regular_search',
    activity: '3P - sample_NFA',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: '3P - sample_NFA',
    objetivo: 450,
  },
  {
    task_type: 'reverse_search',
    activity: 'selection -  Assorment_Amazon',
    objetivo: 450,
  },
  {
    task_type: 'deep',
    activity: 'scraping - cbt_shipping_temu',
    objetivo: 450,
  },
  {
    task_type: 'tag',
    activity: '3P - Enrich image ',
    objetivo: 600,
  },
  {
    task_type: 'tag',
    activity: '3P - Parejas',
    objetivo: 600,
  },
];

const normalizeObjectiveValue = (value: string): string => value.trim().toLowerCase();

export function getObjetivoForRow(row: InventarioRow): ObjetivoEsperado | null {
  const rowTaskType = normalizeObjectiveValue(row.task_type ?? '');
  const rowActivity = normalizeObjectiveValue(row.activity ?? '');

  return (
    OBJETIVOS_ESPERADOS.find(
      (objetivo) =>
        normalizeObjectiveValue(objetivo.task_type) === rowTaskType &&
        normalizeObjectiveValue(objetivo.activity) === rowActivity,
    ) ?? null
  );
}
