// secçõa de importação
import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import api from './services/api';
import './App.css';

function App() {
  const [usuario, setusuario] = useState([]);
  const estadoInicial = {
    numero: '',
    logradouro: '',
    tipo: '',
    extensaoida: '',
    extensaovolta: '',
    status: ''
  };
  

  const [novoUsuario, setnovoUsuario] = useState(estadoInicial); // Objeto para novo usuário
  // Estado para controlar o usuário que está sendo editado
  const [editarUsuario, seteditarUsuario] = useState(null); // Para controlar o modo de edição

  // READ: Carregar usuários da API
  useEffect(() => {
    api.get('/usuario')
      .then(response => {
        setusuario(response.data);
      })
      .catch(error => console.error("Houve um erro ao buscar os usuários:", error));
  }, []);

  // Handler para mudanças nos inputs do formulário
  const update = (event) => {
    const { name, value } = event.target;
    if (editarUsuario) {
      seteditarUsuario({ ...editarUsuario, [name]: value });
    } else {
      setnovoUsuario({ ...novoUsuario, [name]: value });
    }
  };

  // CREATE: Adicionar um novo usuário
  const create = (event) => {
    event.preventDefault();
    api.post('/usuario', novoUsuario)
      .then(response => {
        setusuario([...usuario, response.data]);
        setnovoUsuario(estadoInicial); // Limpa o formulário
      })
      .catch(error => console.error("Houve um erro ao adicionar o usuário:", error));
  };

  // UPDATE: Iniciar a edição de um usuário
  const edicao = (user) => {
    seteditarUsuario(user);
  };

  // UPDATE: Salvar as alterações do usuário
  const updateSave = (event) => {
    event.preventDefault();
    if (!editarUsuario) return;

    api.put(`/usuario/${editarUsuario.id}`, editarUsuario)
      .then(response => {
        setusuario(usuario.map(user => (user.id === editarUsuario.id ? response.data : user)));
        seteditarUsuario(null); // Sai do modo de edição
      })
      .catch(error => console.error("Houve um erro ao atualizar o usuário:", error));
  };

  // Excluir: excluir um usuário
  const excluir = (id) => {
    api.delete(`/usuario/${id}`) // a api busca pelo nome usuario e o id a ser excluido
      .then(() => { //arrow function que recebe a resposta da API
        setusuario(usuario.filter(user => user.id !== id)); //filtra o usuário excluído pelo id
      })
      .catch(error => console.error("Houve um erro ao deletar o usuário:", error)); 
  };
  
   const headers = [
    {label: "Numero", key: "numero"},
    {label: "Logradouro", key: "logradouro"},
    {label: "Tipo", key: "tipo"},
    {label: "Extensão (Ida)", key: "extensaoida"},
    {label: "Extensão (Volta)", key: "extensaovolta"},
    {label: "Status", key: "status"}
   ];

   const exportarPDF = () =>{
    const doc = new jsPDF()
doc.text("Lista de Linhas", 14, 16);
     doc.autoTable({
       head: [['Numero', 'Logradouro', 'Tipo', 'Extensao Ida', 'Extensao Volta', 'Status']],
       body: usuario.map(linha => [
         linha.numero,
         linha.logradouro,
         linha.tipo,
         linha.extensaoida,
         linha.extensaovolta,
         linha.status
       ]),
       startY: 20,
     });

    doc.save("Lista_linhas.pdf");
  };


  // Formulário para adicionar ou editar
  const renderForm = () => {
    const isEditing = !!editarUsuario; //a variável isEditing verifica se estamos no modo de edição
    const user = isEditing ? editarUsuario : novoUsuario; //a variavel user recebe o usuário que está sendo editado ou o novo usuário
    const handleSubmit = isEditing ? updateSave : create; // a variável handleSubmit recebe a função de updateSave se estivermos editando, ou create se estivermos adicionando um novo usuário
    const buttonText = isEditing ? "Salvar Alterações" : "Adicionar Usuário"; // a variável buttonText recebe o texto do botão dependendo se estamos editando ou adicionando um novo usuário

    return ( //ela retorna o formulario com os inputs e o botão
      <form onSubmit={handleSubmit}> 
        <input
          type="text"
          name="numero"
          value={user.numero}
          onChange={update}
          placeholder="Numero"
          required
        />
        <input
          type="text"
          name="logradouro"
          value={user.logradouro}
          onChange={update}
          placeholder="Logradouro"
          required
          />
           <select
          name="tipo"
          value={user.tipo}
          onChange={update}
          placeholder="Tipo"
          required
          >
            <option value="">Selecione o tipo</option>
            <option value="Municipal">Municipal</option>
            <option value="Intermunicipal">Intermunicipal</option>
            <option value="Suburbano">Suburbano</option>
            <option value="Seletivo">Seletivo</option>
            
          </select>
    
        <input
          type="text"
          name="extensaoida"
          value={user.extensaoida}
          onChange={update}
          placeholder="Extensão (Ida)"
          required

        />
        <input
          type="text"
          name="extensaovolta"
          value={user.extensaovolta}
          onChange={update}
          placeholder="Extensão (Volta)"
          required

        />
        <select
    
          name="status"
          value={user.status}
          onChange={update}
          placeholder="Status"
          required
        > <option value="">Selecione o status</option>
          <option value="Ativa">Ativa</option>
          <option value="Parada">Parada</option>
          <option value="Desativada">Desativada</option>
        </select>

        <button type="submit">{buttonText}</button>
        {isEditing && <button onClick={() => seteditarUsuario(null)}>Cancelar Edição</button>}
      </form>
    );
  };

  return (
    <div className="App">
      <h1>Cadastro de Linhas</h1>
      {console.log('Valor atual de "usuario":', usuario)}

      <h2>{editarUsuario ? "Editar Linha" : "Adicionar Nova Linha"}</h2>
      {renderForm()}

      <h2>Lista de Linhas</h2>

      <div className="export-buttons">
        {Array.isArray(usuario) && usuario.length > 0 ? (
        <CSVLink
          data={usuario}
          headers={headers}
          filename={"lista_de_linhas.csv"}
          className="export-btn excel"
          separator={";"}
        >
         
        </CSVLink>
        ) : null}''


        <button onClick={exportarPDF} className="export-btn pdf">
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Numero</th>
            <th>Logradouro</th>
            <th>Tipo</th>
            <th>extensão ida</th>
            <th>extensão volta</th>
            <th>Status</th>
            <th>Edição</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(usuario) && usuario.map(user => ( // Verifica se usuario é um array antes de mapear
            <tr key={user.id}>
              <td>{user.numero}</td>
              <td>{user.logradouro}</td>
              <td>{user.tipo}</td>
              <td>{user.extensaoida}</td>
              <td>{user.extensaovolta}</td>
              <td>{user.status}</td>          
              <td>
                <button className="edit" onClick={() => edicao(user)}>Editar</button>
                <button className="delete" onClick={() => excluir(user.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody> 
      </table>
    </div>
  );
}

export default App;









