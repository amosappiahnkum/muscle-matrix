type Props = {
  loading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
};

const TableContainer = ({ loading, isEmpty, children }: Props) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {!loading && isEmpty ? (
        <div className="py-14 text-center text-gray-400">
          No data found
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default TableContainer;