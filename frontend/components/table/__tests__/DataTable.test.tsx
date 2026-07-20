import { render, screen } from '@/test/test-utils';
import { DataTable, type ColumnDef } from '../DataTable';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { header: 'Name', accessor: (row) => row.name },
  { header: 'Id', accessor: (row) => row.id },
];

describe('DataTable', () => {
  it('renders headers and cell content per column config', () => {
    const rows: Row[] = [
      { id: '1', name: 'Football' },
      { id: '2', name: 'Cricket' },
    ];
    render(<DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Id')).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();
    expect(screen.getByText('Cricket')).toBeInTheDocument();
  });

  it('shows the empty message when there are no rows', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        emptyMessage="Nothing here"
      />,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows a loading state instead of rows while isLoading', () => {
    const rows: Row[] = [{ id: '1', name: 'Football' }];
    render(<DataTable columns={columns} rows={rows} rowKey={(row) => row.id} isLoading />);

    expect(screen.queryByText('Football')).not.toBeInTheDocument();
  });
});
