class Utils {
    /**
     * Retorna a data de um objeto Date formatada no padrão:
     * dd/mm/yyyy hh:mm  
     * 
     * @param {Date} date Objeto do tipo Date.
     * @return {String} Data formatada.
     */
    static dateFormat(date) {
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + 
            ' ' + date.getHours() + ':' + date.getMinutes(); 
    }
}