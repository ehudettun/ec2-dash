'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Button,
} from '@mui/material';

interface Instance {
  name: string;
  id: string;
  type: string;
  state: string;
  az: string;
  publicIp: string;
  privateIp: string;
}

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Instance[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Instance>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/ec2-instances', {  next: { revalidate: 0 }});
          const result = await response.json();
          setData(result);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const handleRequestSort = (property: keyof Instance) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    const sortedData = [...data].sort((a, b) => {
      if (a[property] < b[property]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[property] > b[property]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setData(sortedData);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <p className="flex items-center justify-center h-screen">Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Typography variant="h4" component="h1" gutterBottom className="text-center">
          EC2 Status Dashboard
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom className="text-center">
          Ehud Ettun - HW assignment for cisco
        </Typography>
        <Button className="mt-4" onClick={() => signIn()}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <Container className="mt-10">
      <Typography variant="h4" component="h1" gutterBottom className="text-center">
        Dashboard
      </Typography>
      <Button className="mb-4" onClick={() => signOut()}>
        Sign out
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleRequestSort('type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'state'}
                  direction={orderBy === 'state' ? order : 'asc'}
                  onClick={() => handleRequestSort('state')}
                >
                  State
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'az'}
                  direction={orderBy === 'az' ? order : 'asc'}
                  onClick={() => handleRequestSort('az')}
                >
                  AZ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'publicIp'}
                  direction={orderBy === 'publicIp' ? order : 'asc'}
                  onClick={() => handleRequestSort('publicIp')}
                >
                  Public IP
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'privateIp'}
                  direction={orderBy === 'privateIp' ? order : 'asc'}
                  onClick={() => handleRequestSort('privateIp')}
                >
                  Private IP
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.state}</TableCell>
                <TableCell>{row.az}</TableCell>
                <TableCell>{row.publicIp}</TableCell>
                <TableCell>{row.privateIp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

export default Dashboard;