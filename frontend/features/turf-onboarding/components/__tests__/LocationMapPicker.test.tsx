import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { OlaMaps } from 'olamaps-web-sdk';
import { LocationMapPicker } from '../LocationMapPicker';
import { searchLocation } from '../../lib/searchLocation';

jest.mock('olamaps-web-sdk', () => ({
  OlaMaps: jest.fn(),
}));
jest.mock('../../lib/searchLocation');
const searchLocationMock = jest.mocked(searchLocation);

type ClickHandler = (event: { lngLat: { lng: number; lat: number } }) => void;

describe('LocationMapPicker', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls onChange with the clicked coordinates', async () => {
    let clickHandler: ClickHandler | undefined;
    const map = {
      on: jest.fn((event: string, handler: ClickHandler) => {
        if (event === 'click') clickHandler = handler;
      }),
      remove: jest.fn(),
    };
    const marker = { setLngLat: jest.fn().mockReturnThis(), addTo: jest.fn().mockReturnThis() };
    const init = jest.fn().mockResolvedValue(map);
    const addMarker = jest.fn().mockReturnValue(marker);
    (OlaMaps as unknown as jest.Mock).mockImplementation(() => ({ init, addMarker }));

    const onChange = jest.fn();
    render(<LocationMapPicker value={null} onChange={onChange} apiKey="test-api-key" />);

    await waitFor(() => expect(clickHandler).toBeDefined());

    clickHandler?.({ lngLat: { lng: 80.2707, lat: 13.0827 } });

    expect(onChange).toHaveBeenCalledWith({ lat: 13.0827, lng: 80.2707 });
    expect(addMarker).toHaveBeenCalled();
  });

  it('shows a configuration error when no API key is provided', () => {
    const { getByRole } = render(
      <LocationMapPicker value={null} onChange={jest.fn()} apiKey={undefined} />,
    );
    expect(getByRole('alert')).toHaveTextContent(/not configured/i);
  });

  it('places a marker and calls onChange when a search result is found', async () => {
    const map = { on: jest.fn(), remove: jest.fn(), flyTo: jest.fn() };
    const marker = { setLngLat: jest.fn().mockReturnThis(), addTo: jest.fn().mockReturnThis() };
    const init = jest.fn().mockResolvedValue(map);
    const addMarker = jest.fn().mockReturnValue(marker);
    (OlaMaps as unknown as jest.Mock).mockImplementation(() => ({ init, addMarker }));
    searchLocationMock.mockResolvedValueOnce({
      lat: 13.0827,
      lng: 80.2707,
      formattedAddress: 'Chennai, India',
    });

    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<LocationMapPicker value={null} onChange={onChange} apiKey="test-api-key" />);

    await waitFor(() => expect(init).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/search location/i), 'Chennai');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ lat: 13.0827, lng: 80.2707 }));
    expect(addMarker).toHaveBeenCalled();
  });

  it('shows an error when the search finds no location', async () => {
    const map = { on: jest.fn(), remove: jest.fn(), flyTo: jest.fn() };
    const init = jest.fn().mockResolvedValue(map);
    const addMarker = jest.fn();
    (OlaMaps as unknown as jest.Mock).mockImplementation(() => ({ init, addMarker }));
    searchLocationMock.mockResolvedValueOnce(null);

    const user = userEvent.setup();
    render(<LocationMapPicker value={null} onChange={jest.fn()} apiKey="test-api-key" />);

    await waitFor(() => expect(init).toHaveBeenCalled());
    await user.type(screen.getByLabelText(/search location/i), 'Nowhereville');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no matching location/i));
  });
});
