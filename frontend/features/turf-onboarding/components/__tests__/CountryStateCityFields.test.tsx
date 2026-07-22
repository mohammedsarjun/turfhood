import { useState } from 'react';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { CountryStateCityFields, type CountryStateCityValue } from '../CountryStateCityFields';
import { listCities, listCountries, listStates } from '../../actions/locationApi';

jest.mock('../../actions/locationApi');
const listCountriesMock = jest.mocked(listCountries);
const listStatesMock = jest.mocked(listStates);
const listCitiesMock = jest.mocked(listCities);

function Harness() {
  const [value, setValue] = useState<CountryStateCityValue>({
    country: null,
    state: null,
    city: null,
  });
  return <CountryStateCityFields value={value} onChange={setValue} />;
}

describe('CountryStateCityFields', () => {
  beforeEach(() => {
    listCountriesMock.mockResolvedValue({ items: [{ name: 'India', code: 'IN' }] });
    listStatesMock.mockResolvedValue({ items: [{ name: 'Tamil Nadu', code: 'TN' }] });
    listCitiesMock.mockResolvedValue({ items: [{ name: 'Chennai', code: '1' }] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads countries on mount, then cascades to states and cities on selection', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const [countrySelect, stateSelect, citySelect] = screen.getAllByRole('combobox');

    await waitFor(() => expect(listCountriesMock).toHaveBeenCalled());
    await user.selectOptions(countrySelect, 'IN');

    await waitFor(() => expect(listStatesMock).toHaveBeenCalledWith('IN'));
    await waitFor(() => expect(stateSelect).not.toBeDisabled());

    await user.selectOptions(stateSelect, 'TN');

    await waitFor(() => expect(listCitiesMock).toHaveBeenCalledWith('IN', 'TN'));
    await waitFor(() => expect(citySelect).not.toBeDisabled());

    await user.selectOptions(citySelect, '1');
    expect(citySelect).toHaveValue('1');
  });

  it('disables state and city until their parent selection is made', () => {
    render(<Harness />);
    const [, stateSelect, citySelect] = screen.getAllByRole('combobox');
    expect(stateSelect).toBeDisabled();
    expect(citySelect).toBeDisabled();
  });
});
