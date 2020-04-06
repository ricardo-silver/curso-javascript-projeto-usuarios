class User {

    constructor(name, gender, birth, country, email, password, photo, admin) {
        this._admin;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;

        this._register = new Date();
    }

    /* Getters & Setters */
    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }
    
    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get photo() {
        return this._photo;
    }

    get admin() {
        return this._admin;
    }

    get register() {
        return this._register;
    }

    set country(value) {
        this._country = value;
    }

    set photo(value) {
        this._photo = value;
    }

    /* Methods */
    /**
     * Carrega um usuário a partir de um JSON.
     * 
     * @param {JSON} json JSON com os dados.
     */
    loadFromJSON(json) {
        for (let name in json) {
            switch(name) {
                case '_register':
                    this[name] = new Date(json[name]);
                break;

                default:
                    this[name] = json[name];
            }
        }
    }

    /**
     * Cria um novo id no storage.
     * - Verifica se já existe um id no escopo antes de criar.
     * 
     * @return {Number} ID global.
     */
    getNewID() {

        let usersID = parseInt(localStorage.getItem('usersID'));

        if (!usersID > 0) usersID = 0;

        usersID++;

        localStorage.setItem('usersID', usersID);

        return usersID;
    }

    /* CRUD - User */
    /**
     * Salva um usuário no storage.
     * - Verfica se já existe um usuário com o mesmo id.
     * - Se existir, adiciona os novos dados ao usuário existente.
     * - Caso contrário cria um novo usuário.
     */
    save() {
        let users = User.getUsersStorage();

        if (this.id > 0) {
            users.map(user => {
                if (user._id == this.id) {
                    Object.assign(user, this);
                }
                return user;
            });
        } else {
            this._id = this.getNewID();

            users.push(this);
        }

        localStorage.setItem('users', JSON.stringify(users));
    }

    /**
     * Pega os usuários do storage.
     * 
     * @return {Array} Usuários na storage.
     */
    static getUsersStorage() {
        let users = [];

        // verifica se já existem usuários no storage
        if (localStorage.getItem('users')) {
            users = JSON.parse(localStorage.getItem('users'));
        }

        return users;
    }

    /**
     * Remove um usuário especificado do storage.
     */
    remove() {
        let users = User.getUsersStorage();

        users.forEach((userData, index) => {
            if (this._id == userData._id) {
                users.splice(index, 1);
            }
        });
        
        localStorage.setItem('users', JSON.stringify(users));        
    }
}