class UserController {
    /**
     * UserController constructor.
     * 
     * @param {string} formIDCreate ID do formulário de criação.
     * @param {string} formIDUpdate ID do formulário de edição.
     * @param {string} tableID ID da tabela.
     */
    constructor(formIDCreate, formIDUpdate, tableID) {
        this.formEl = document.getElementById(formIDCreate);
        this.formUpdateEl = document.getElementById(formIDUpdate);
        this.tableEl = document.getElementById(tableID);

        this.onSubmit();
        this.onEdit();

        this.selectAll();
    }

    /**
     * Pega os valores do formulário recebido e 
     * cria dinamicamente as chaves e os dados para um objeto user.
     * 
     * @param formEl Formulário.
     * @return {User} User.
     */
    getValues(formEl) {

        let user = {};
        let isValid = true;

        // Solução com spread operator
        [...formEl.elements].forEach(function(field, index) {

            /* Validação de campos. */
            /* 
             * Utiliza a lógica de indexOf para arrays, já que, neste método,
             * quando não é encontrado um índice com o valor o indexOf retorna -1.
             * Além disso, o valor do campo precisa ser diferente de vazio ou não existe.
            */
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                // neste caso é preciso acessar o elemento pai do input e adicionar a classe css "has-error"
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            /*
             * Verificando se os campos "gender" e "admin" estão checados. 
            */
            if (field.name == 'gender') {
                if (field.checked) {
                    user[field.name] = field.value;
                }
            } else if(field.name == 'admin') {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }          
        });

        // se o formulário não estiver válido, não deve criar um usuário.
        if (!isValid) return false;

        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin
        );
    }

    /**
     * Utiliza a api FileReader para trazer uma imagem
     * selecionada pelo usuário para o frontend.
     * 
     * @return {Promise} Promisse para a imagem.
     */
    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            // buscando o elemento photo
            let elements = [...formEl.elements].filter(item => {
                if (item.name === 'photo') return item;
            });

            let file = elements[0].files[0];
            
            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e)
            };

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }

        });
    }

    /**
     * Trata o evento de submissão do formulário.
     */
    onSubmit() {
        // submit do formulário
        this.formEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formEl.querySelector('[type=submit]');

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getPhoto(this.formEl).then(
                (content) => {
                    values.photo = content;

                    values.save();

                    this.addLine(values);

                    this.formEl.reset();

                    btn.disabled = false;
                },
                (e) => {
                    console.error(e);
                }
            );
            
        });
    }

    /**
     * Trata os eventos de edição do formulário.
     * 
     * Trata evento de click no botão que cancela edição.
     * Trata evento de submissão de formulário.
     * 
     * Chama o método para criar uma tr baseada nos dados editados.
     */
    onEdit() {
        // botão de cancelar
        document.querySelector("#box-user-update .btn-cancel").addEventListener('click', e => {
            this.showPanelCreate();
        });

        // submit do formulário
        this.formUpdateEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formUpdateEl.querySelector('[type=submit]');
            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            // referenciando o índice que foi criado quando houve o click em "editar"
            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            // mesclando os dados
            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    // precisa verificar se existe foto no usuário antigo
                    if (!values._photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save();

                    this.renderTr(user, tr);

                    this.updateCount();

                    this.formUpdateEl.reset();
                    
                    btn.disabled = false;
                    
                    this.showPanelCreate();
                },
                (e) => {
                    console.error(e);
                }
            );

        });
    }
  
    /**
     * Adiciona eventos em uma tr especificada.
     * - Trata evento o botão de edição.
     * - Trata evento no botão de excluir.
     * 
     * @param {HTMLElement} tr  Tr que receberá o evento.
     */
    addEventsTr(tr) {
        // botão editar
        tr.querySelector('.btn-edit').addEventListener('click', e => {
            let json = JSON.parse(tr.dataset.user);

            // Estabelecendo um id para o registro que será editado.
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            /**
             * Como os dados recuperados vai dataset são um objeto novo copiado do User,
             * as propriedades privadas estão com um underline (_). É preciso percorrer
             * este novo objeto e comparar as propriedades com os campos do formulário,
             * que não possuem underline e então retirar o underline dessas propriedades.
             */
            for (let name in json) {
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
                
                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                        break;
                    
                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] +"]");
                            field.checked = true;
                        break;

                        case 'checkbox':
                            field.checked = json[name];
                        break;

                        default:
                            field.value = json[name];
                    }
                }
            }

            this.formUpdateEl.querySelector('.photo').src = json._photo;

            this.showPanelUpdate();
        });

        // botão excluir
        // - Cria uma instância de User através do dataset do elemento.
        // - Chama método que deleta o usuário do storage
        tr.querySelector('.btn-delete').addEventListener('click', e => {
            if (confirm("Deseja realmente excluir?")) {
                
                let user = new User();
                
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                
                user.remove();

                tr.remove();

                this.updateCount();
            }
        });
    }

    /**
     * Lista todos os dados armazenados na storage.
     * Adiciona uma linha na tabela para cada um deles utilizando o método addLine().
     */
    selectAll () {
        let users = User.getUsersStorage();

        users.forEach(dataUser => {
            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);
        });
    }
    
    /**
     * Adiciona uma nova linha na tabela de usuários.
     * - Recebe dados que foram preenchidos no formulário de criação de usuário.
     * - Chama o método para inserir estes dados em um local de armazenagem.
     * - Chama o método para criar uma tr baseada nestes dados. 
     * - Insere a tr na tabela.
     * 
     * @param {User} dataUser Objeto com dados do Usuário.
     */
    addLine(dataUser) {

        let tr = this.renderTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    /**
     * Atualiza os contadores de usuários.
     * - Percorre cada elemento contido na tabela.
     * - Atualiza o total de usuários na view.
     * - Atualiza o total de usuários admin na view.
     */
    updateCount() {
        let numberUsers = 0;
        let numberAdmins = 0;

        [...this.tableEl.children].forEach(tr => {
            numberUsers++;

            // Recuperando dados do usuário através do dataset.
            // Feito para fins didáticos. Não é seguro.
            let user = JSON.parse(tr.dataset.user);

            if (user._admin) numberAdmins++;
        });

        // concluída a contagem, envia para o html
        document.querySelector('#number-users').innerHTML = numberUsers;
        document.querySelector('#number-users-admins').innerHTML = numberAdmins;
    }

    /**
     * Mostra o painel de criação de usuário.
     */
    showPanelCreate() {
        document.querySelector('#box-user-create').style.display = 'block';
        document.querySelector('#box-user-update').style.display = 'none';
    }

    /**
     * Mostra o painel de edição de usuário.
     */
    showPanelUpdate() {
        document.querySelector('#box-user-create').style.display = 'none';
        document.querySelector('#box-user-update').style.display = 'block';
    }

    /* View */
    /**
     * Recebe um objeto com dados e retorna uma linha na tabela com estes dados.
     * 
     * @param {User} data Objeto com dados.
     * @param {*} tr (Opcional) Tr onde as tds serão criadas.
     * 
     * @return {HTMLElement} Linha com os dados para a  tabela.
     */
    renderTr(data, tr = null) {
        if (tr === null) tr = document.createElement('tr');

        // Serializa os dados do usuário para a criação do dataset.
        // Isso foi feito para fins didáticos. Não é seguro.
        tr.dataset.user = JSON.stringify(data);

        tr.innerHTML = `
            <td><img src="${data.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${(data.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(data.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        return tr;
    }
}