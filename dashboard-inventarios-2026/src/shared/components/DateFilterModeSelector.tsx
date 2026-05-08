import {
  getDateFilterValidationMessage,
  MONTH_OPTIONS,
  type DateFilterMode,
  type DateFilterValue,
} from '../utils/dates';

interface DateFilterModeSelectorProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
}

export function DateFilterModeSelector({ value, onChange }: DateFilterModeSelectorProps) {
  const validationMessage = getDateFilterValidationMessage(value);

  function handleModeChange(mode: DateFilterMode): void {
    onChange({
      mode,
      month: value.month,
      from: '',
      to: '',
    });
  }

  return (
    <div className="date-filter">
      <label className="field">
        <span className="field__label">Fecha</span>
        <select
          className="select-control"
          value={value.mode}
          onChange={(event) => handleModeChange(event.target.value as DateFilterMode)}
        >
          <option value="month">Mes</option>
          <option value="range">Rango</option>
        </select>
      </label>

      {value.mode === 'month' ? (
        <label className="field">
          <span className="field__label">Mes</span>
          <select
            className="select-control"
            value={value.month}
            onChange={(event) =>
              onChange({
                mode: 'month',
                month: Number(event.target.value),
                from: '',
                to: '',
              })
            }
          >
            {MONTH_OPTIONS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <>
          <label className="field">
            <span className="field__label">Desde</span>
            <input
              className="input-control"
              type="date"
              value={value.from}
              onChange={(event) =>
                onChange({
                  ...value,
                  mode: 'range',
                  from: event.target.value,
                })
              }
            />
          </label>

          <label className="field">
            <span className="field__label">Hasta</span>
            <input
              className="input-control"
              type="date"
              value={value.to}
              onChange={(event) =>
                onChange({
                  ...value,
                  mode: 'range',
                  to: event.target.value,
                })
              }
            />
          </label>
        </>
      )}

      {validationMessage ? (
        <div className="date-filter__message" role="status">
          {validationMessage}
        </div>
      ) : null}
    </div>
  );
}
