import React, { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import CustomersAPI from '../services/CustomersAPI';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import TableLoader from '../components/loader/TableLoader';

const CustomersPage = (props) => {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Permet d'aller récupérer les customers
  const fetchCustomers = async () => {
    try {
      const data = await CustomersAPI.findAll();
      setCustomers(data);
      setLoading(false);
    } catch(error) {
      toast.error("Impossible de charger les clients");
    }
  }

  // Au chargement du composant, on va chercher les customers
  useEffect(() => {
    fetchCustomers();

    // Deuxième façon de faire une requête (traitement de promesses)
    // CustomersAPI.findAll()
    //   .then(data => setCustomers(data))
    //   .catch(error => console.log(error.response));
  }, [])
  
  // Gestion de la suprresion d'un customer
  const handleDelete = async id => {
    const originalCustomers = [...customers];

    // 1. L'approche optimiste
    setCustomers(customers.filter(customer => customer.id !== id))

    // 2. L'approche pessimiste
    try {
      await CustomersAPI.delete(id);
      toast.success("Le client a bien été supprimé");
    } catch(error) {
      setCustomers(originalCustomers);
      toast.error("La suppression du lcient n'a pas pu fonctionner");
    }

    // Deuxième façon de faire une requête (traitement de promesses)
    // CustomersAPI.delete(id)
    //   .then(response => console.log("ok"))
    //   .catch(error => { 
    //     setCustomers(originalCustomers);
    //     console.log(error.response);
    //   });
  }

  // Gestion du changement de page
  const handlePageChange = page => setCurrentPage(page);

  // Gestion de la recherche
  const handleSearch = ({ currentTarget }) => {
    setSearch(currentTarget.value);
    setCurrentPage(1);
  };

  const itemsPerPage = 10;

  //Filtrage des customers en fonction de la recherche
  const filteredCustomers = customers.filter(
    c => 
      c.firstName.toLowerCase().includes(search.toLowerCase()) || 
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination des données
  const paginatedCustomers = Pagination.getData(
    filteredCustomers, 
    currentPage, 
    itemsPerPage
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h1>Liste des clients</h1>
        <Link to="/customers/new" className="btn btn-primary">
          Créer un client
        </Link>
      </div>

      <div className="form-group">
        <input 
          type="text" 
          onChange={handleSearch} 
          value = {search} 
          className="form-control" 
          placeholder="Rechercher..." 
        />
      </div>

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Id.</th>
            <th>Client</th>
            <th>Email</th>
            <th>Entreprise</th>
            <th className="text-center">Factures</th>
            <th className="text-center">Montant total</th>
          </tr>
        </thead>

        {!loading && (
          <tbody>
            {paginatedCustomers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>
                  <Link to={"/customers/" + customer.id} className="text-decoration-none">
                    {customer.firstName} {customer.lastName}
                  </Link>
                </td>
                <td>{customer.email}</td>
                <td>{customer.company}</td>
                <td className="text-center">
                  <span className="badge bg-primary">{customer.invoices.length}</span> 
                </td>
                <td className="text-center">{customer.totalAmount.toLocaleString()} €</td>
                <td>
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    disabled={customer.invoices.length > 0} 
                    className="btn btn-sm btn-danger">Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {loading && <TableLoader />}

      {itemsPerPage < filteredCustomers.length &&  
        <Pagination 
          currentPage={currentPage} 
          itemsPerPage={itemsPerPage} 
          length={filteredCustomers.length}
          onPageChanged={handlePageChange} 
        /> 
      }
    </>
  )
}

export default CustomersPage;