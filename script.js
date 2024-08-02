// Api para o cep => inicial
    const buscarEnderecoPorCEP = (cep) => {
        $.ajax({
            url: `https://viacep.com.br/ws/${cep}/json/`,
            method: 'GET',
            dataType: 'json',
            success: (data) => {
                if (!("erro" in data)) {
                    $('#endereco').val(data.logradouro);
                    $('#bairro').val(data.bairro);
                    $('#municipio').val(data.localidade);
                    $('#estado').val(data.uf);
                } else {
                    alert("CEP não encontrado.");
                }
            },
            error: () => {
                alert("Erro ao buscar o endereço. Tente novamente.");
            }
        });
    };

    // => produtos
    const addProduct = (index) => {
        const productTemplate = `
            <div class="product-item border rounded p-3 mb-3" data-index="${index}">
                <div class="d-flex align-items-center mb-3">
                    <i class="fas fa-box fa-2x mr-3"></i>
                    <h5 class="m-0">Produto ${index}</h5>
                    <button type="button" class="btn btn-danger btn-remove-product ml-auto"><i class="fas fa-trash-alt"></i></button>
                </div>
                <form class="product-form" data-index="${index}">
                    <div class="form-row align-items-end">
                        <div class="form-group col-md-2">
                            <label for="produto${index}-nome">Descrição</label>
                            <input type="text" class="form-control" id="produto${index}-nome" name="produto${index}-nome" required>
                        </div>
                        <div class="form-group col-md-2">
                            <label for="produto${index}-und">Unidade de Medida</label>
                            <select class="form-control" id="produto${index}-und" name="produto${index}-und" required>
                                <option value="">Selecione...</option>
                                <option value="unidade">Unidade</option>
                                <option value="caixa">Caixa</option>
                            </select>
                        </div>
                        <div class="form-group col-md-2">
                            <label for="produto${index}-qtd">Quantidade em Estoque</label>
                            <input type="number" class="form-control" id="produto${index}-qtd" name="produto${index}-qtd" required>
                        </div>
                        <div class="form-group col-md-2">
                            <label for="produto${index}-valor-unit">Valor Unitário</label>
                            <input type="text" class="form-control valor-unitario" id="produto${index}-valor-unit" name="produto${index}-valor-unit" required>
                        </div>
                        <div class="form-group col-md-2">
                            <label for="produto${index}-valor-total">Valor Total</label>
                            <input type="text" class="form-control valor-total" id="produto${index}-valor-total" name="produto${index}-valor-total" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-2">
                            <button type="button" class="btn btn-primary btn-add-product" data-index="${index}">Enviar Produto</button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        $('#products').append(productTemplate);
    };

    // => anexos

    $(document).ready(() => {
        // reload
        sessionStorage.removeItem('anexos');
        
        let productIndex = 1;
        let anexoIndex = 1;
        let anexos = [];

    const addAnexo = (index, nome, blob) => {
        const anexoTemplate = `
            <div class="anexo-item mb-3" data-index="${index}">
                <button type="button" class="btn btn-danger btn-remove-anexo"><i class="fas fa-trash-alt"></i></button>
                <button type="button" class="btn btn-info btn-visualizar-anexo"><i class="fas fa-eye"></i></button>
                <span>${nome}</span>
            </div>
        `;
        $('#anexo-lista').append(anexoTemplate);
        anexos.push({ index, nome, blob });
        sessionStorage.setItem('anexos', JSON.stringify(anexos));
    };

    const removerAnexo = (index) => {
        const anexoIndex = anexos.findIndex(anexo => anexo.index === index);
        if (anexoIndex !== -1) {
            anexos.splice(anexoIndex, 1);
            sessionStorage.setItem('anexos', JSON.stringify(anexos));
        }
    };

    // eventos de interação => anexos
    $('#add-anexo').click(() => {
        $('#file-input').click();
    });

    $('#file-input').change((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const blob = new Blob([e.target.result], { type: file.type });
                addAnexo(anexoIndex, file.name, blob);
                anexoIndex++;
            };
            reader.readAsArrayBuffer(file);
        }
        // limpar input podendo ser adicionado novamente
        $('#file-input').val('');
    });

    $(document).on('click', '.btn-remove-anexo', function() {
        const index = parseInt($(this).closest('.anexo-item').data('index'), 10);
        removerAnexo(index);
        $(this).closest('.anexo-item').remove();
    });

    $(document).on('click', '.btn-visualizar-anexo', function() {
        const index = parseInt($(this).closest('.anexo-item').data('index'), 10);
        const anexo = anexos.find(anexo => anexo.index === index);
        if (anexo) {
            const url = URL.createObjectURL(anexo.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = anexo.nome;
            a.click();
            URL.revokeObjectURL(url);
        }
    });

    // iterando com Dom
    $('#cep').blur(function() {
        const cep = $(this).val().replace(/\D/g, '');
        if (cep !== "") {
            buscarEnderecoPorCEP(cep);
        }
    });

    $('#add-product').click(() => {
        addProduct(productIndex);
        productIndex++;
    });

    $(document).on('input', '.product-form input', function() {
        const $form = $(this).closest('.product-form');
        const qty = parseFloat($form.find('input[name$="-qtd"]').val()) || 0;
        const unitPrice = parseFloat($form.find('input[name$="-valor-unit"]').val().replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        const totalPrice = qty * unitPrice;

        $form.find('input[name$="-valor-total"]').val(totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    });

    $(document).on('blur', '.valor-unitario', function() {
        const value = parseFloat($(this).val().replace(/[^\d,-]/g, '').replace(',', '.'));
        if (!isNaN(value)) {
            $(this).val(value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        } else {
            $(this).val('');
        }
    });

    $(document).on('click', '.btn-remove-product', function() {
        $(this).closest('.product-item').remove();
        const remainingProducts = $('.product-item');
        if (remainingProducts.length > 0) {
            productIndex = Math.max.apply(Math, remainingProducts.map(function() {
                return parseInt($(this).data('index'), 10);
            }).get()) + 1;
        } else {
            productIndex = 1;
        }
    });

    $(document).on('click', '.btn-add-product', function() {
        const index = $(this).data('index');
        const $form = $(`.product-form[data-index=${index}]`);
        
        let allFilled = true;
        $form.find('input[required], select[required]').each(function() {
            if ($(this).val() === '' || $(this).val() === null) {
                allFilled = false;
                return false;
            }
        });

        if (!allFilled) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const productData = {
            descricao: $form.find(`input[id^="produto"][id$="-nome"]`).val(),
            unidade: $form.find(`select[id^="produto"][id$="-und"]`).val(),
            quantidade: parseFloat($form.find(`input[id^="produto"][id$="-qtd"]`).val()) || 0,
            valorUnitario: parseFloat($form.find(`input[id^="produto"][id$="-valor-unit"]`).val().replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
            valorTotal: parseFloat($form.find(`input[id^="produto"][id$="-valor-total"]`).val().replace(/[^\d,-]/g, '').replace(',', '.')) || 0
        };

        console.log('Produto enviado:', productData);
        alert(`Produto ${index} enviado com sucesso!`);

        $form[0].reset();
        $form.find('input[id^="produto"][id$="-valor-total"]').val('');
    });

    // Validação antes de salvar
    $('#salvar-fornecedor').click(() => {
        if (anexos.length === 0) {
            alert('Inclua pelo menos um documento.');
            return;
        }

        // Mostrar modal de loading
        $('#loadingModal').modal('show');

        // Capturar dados do fornecedor e dos produtos
        const fornecedor = {
            razaoSocial: $('#razao-social').val(),
            cnpj: $('#cnpj').val(),
            nomeFantasia: $('#nome-fantasia').val(),
            inscricaoEstadual: $('#inscricao-estadual').val(),
            cep: $('#cep').val(),
            endereco: $('#endereco').val(),
            numero: $('#numero').val(),
            complemento: $('#complemento').val(),
            bairro: $('#bairro').val(),
            municipio: $('#municipio').val(),
            estado: $('#estado').val(),
            contato: $('#contato').val(),
            telefone: $('#telefone').val(),
            email: $('#email').val(),
        };

        const produtos = $('.product-item').map(function() {
            const index = $(this).data('index');
            const $form = $(`.product-form[data-index=${index}]`);
            return {
                descricao: $form.find(`input[id^="produto"][id$="-nome"]`).val(),
                unidade: $form.find(`select[id^="produto"][id$="-und"]`).val(),
                quantidade: parseFloat($form.find(`input[id^="produto"][id$="-qtd"]`).val()) || 0,
                valorUnitario: parseFloat($form.find(`input[id^="produto"][id$="-valor-unit"]`).val().replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                valorTotal: parseFloat($form.find(`input[id^="produto"][id$="-valor-total"]`).val().replace(/[^\d,-]/g, '').replace(',', '.')) || 0
            };
        }).get();

        const jsonData = {
            fornecedor,
            produtos,
            anexos: anexos.map(anexo => ({ nome: anexo.nome })) // Não podemos enviar o blob pelo JSON
        };

        // Simular um atraso de envio
        setTimeout(() => {
            $('#loadingModal').modal('hide');
            console.log(JSON.stringify(jsonData, null, 2));

            // Para baixar o JSON
            const a = document.createElement('a');
            const file = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            a.href = URL.createObjectURL(file);
            a.download = 'fornecedor_dados.json';
            a.click();
            URL.revokeObjectURL(a.href);

            alert('Fornecedor salvo com sucesso!');
        }, 2000); // Simula um atraso de 2 segundos
    });

    // Inicializar o primeiro produto se nenhum produto existir
    if ($('.product-item').length === 0) {
        addProduct(productIndex);
        productIndex++;
    }
});
