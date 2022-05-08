import moment from "moment";
import React, { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import InvoicesAPI from '../services/InvoicesAPI';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import TableLoader from '../components/loader/TableLoader';

// const STATUS_CLASSES = {
//     PAID: "success",
//     SENT: "primary",
//     CANCELLED: "danger"
// }

const STATUS_LABELS = {
    PAID: "Payée",
    SENT: "Envoyée",
    CANCELLED: "Annulée"
}

const STATUS_EMOTS = {
    PAID: "💶",
    SENT: "✅",
    CANCELLED: "❌"
}

const InvoicesPage = (props) => {
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 10;
  const formatDate = (str) => moment(str).format('DD/MM/YYYY');
  const [loading, setLoading] = useState(true);

  // Récupération des invoices auprès de l'API
  const fetchInvoices = async () => {
      try {
        const data = await InvoicesAPI.findAll();
        setInvoices(data);
        setLoading(false);
      } catch (error) {
        toast.error("Erreur lors du chargement des factures !");
      }
  };

  // Charger les invoices au chargement de page
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Gestion du changement de page
  const handlePageChange = page => setCurrentPage(page);

  // Gestion de la recherche
  const handleSearch = ({ currentTarget }) => {
    setSearch(currentTarget.value);
    setCurrentPage(1);
  };

  // Gestion de la suprresion d'une invoice
  const handleDelete = async id => {
    const originalInvoices = [...invoices];
    setInvoices(invoices.filter(invoice => invoice.id !== id))
    toast.success("La facture a bien été supprimée");
    try {
      await InvoicesAPI.delete(id);
    } catch(error) {
      toast.error("Une erreur est survenue");
      setInvoices(originalInvoices);  
    }
  }

  //Filtrage des customers en fonction de la recherche
  const filteredInvoices = invoices.filter(
    i => 
      i.customer.firstName.toLowerCase().includes(search.toLowerCase()) || 
      i.customer.lastName.toLowerCase().includes(search.toLowerCase()) ||
      i.amount.toString().startsWith(search.toLowerCase()) ||
      STATUS_LABELS[i.status].toLowerCase().includes(search.toLocaleLowerCase())
  );

  // Pagination des données
  const paginatedInvoices = Pagination.getData(
    filteredInvoices, 
    currentPage, 
    itemsPerPage
  );

  return (
    <>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <h1>Liste des factures</h1>
          <Link to="/invoices/new" className="btn btn-primary">
            Créer une facture
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
                    <th>Numéro</th>
                    <th>Client</th>
                    <th className="text-center">Date d'envoi</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center">Montant</th>
                    <th></th>
                </tr>
            </thead>
            {!loading && (
              <tbody>
                  {paginatedInvoices.map(invoice => (
                    <tr key={invoice.id}>
                        <td>{invoice.id}</td>
                        <td>
                          <Link to={"/invoices/" + invoice.id} className="text-decoration-none" >
                            {invoice.customer.firstName} {invoice.customer.lastName}
                          </Link> 
                        </td>
                        <td className="text-center">{formatDate(invoice.sentAt)}</td>
                        <td className="text-center">
                            <span>{STATUS_EMOTS[invoice.status]}</span>
                        </td>
                        <td className="text-center">{invoice.amount.toLocaleString()} €</td>
                        <td>
                            <Link to={"/invoices/" + invoice.id} className="btn btn-sm btn-primary me-1">Editer</Link>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(invoice.id)}>Supprimer</button>
                        </td>
                    </tr>
                  ))}
              </tbody>
            )}
        </table>
        {loading && <TableLoader />}

        <Pagination 
          currentPage={currentPage} 
          itemsPerPage={itemsPerPage} 
          length={filteredInvoices.length}
          onPageChanged={handlePageChange} 
        /> 
    </>
  )
}

export default InvoicesPage;