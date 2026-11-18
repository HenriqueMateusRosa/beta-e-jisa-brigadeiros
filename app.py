from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
from decimal import Decimal, InvalidOperation
from dotenv import load_dotenv
from psycopg.rows import dict_row
import psycopg
import os
import hmac

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / '.env')
DATABASE_URL = os.getenv('DATABASE_URL', '')
app = Flask(__name__, static_folder=None)

def connection():
    if not DATABASE_URL:
        raise RuntimeError('Configure DATABASE_URL no arquivo .env')
    return psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=10)

def centavos(valor):
    return int((Decimal(str(valor)) * 100).quantize(Decimal('1')))

@app.get('/')
def home():
    return send_from_directory(BASE, 'index.html')

@app.get('/<path:path>')
def static_file(path):
    if path.startswith(('api/', '.')) or path.endswith(('.py','.md','.txt','.json','.lock','.config.js','.map','.sql')) or path in ('requirements.txt', 'package.json', 'package-lock.json'):
        return jsonify(erro='Não encontrado'), 404
    return send_from_directory(BASE, path)

@app.get('/api/produtos')
def produtos():
    with connection() as db:
        rows = db.execute('SELECT id, nome, preco, imagem FROM produtos WHERE ativo = TRUE ORDER BY id').fetchall()
    return jsonify([{'id': p['id'], 'nome': p['nome'], 'preco_centavos': centavos(p['preco']), 'imagem': p['imagem']} for p in rows])

@app.post('/api/pedidos')
def criar_pedido():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify(erro='JSON inválido'), 400
    cliente = str(data.get('cliente') or '').strip()
    telefone = str(data.get('telefone') or '').strip()
    endereco = str(data.get('endereco') or '').strip()
    observacao = str(data.get('observacao') or '').strip()[:1000]
    itens = data.get('itens')
    if not (cliente and telefone and endereco) or len(cliente) > 120 or len(telefone) > 30 or len(endereco) > 300:
        return jsonify(erro='Informe nome, telefone e endereço válidos'), 400
    if not isinstance(itens, list) or not 1 <= len(itens) <= 50:
        return jsonify(erro='Pedido precisa conter de 1 a 50 itens'), 400
    try:
        normalizados = [(int(x['produto_id']), int(x['quantidade'])) for x in itens]
        if any(i < 1 or q < 1 or q > 100 for i, q in normalizados):
            raise ValueError()
        if len({i for i, _ in normalizados}) != len(normalizados):
            raise ValueError()
    except (KeyError, TypeError, ValueError):
        return jsonify(erro='Itens inválidos'), 400
    with connection() as db:
        with db.transaction():
            ids = [i for i, _ in normalizados]
            rows = db.execute('SELECT id, nome, preco FROM produtos WHERE ativo = TRUE AND id = ANY(%s)', (ids,)).fetchall()
            catalogo = {p['id']: p for p in rows}
            if len(catalogo) != len(ids):
                return jsonify(erro='Produto indisponível'), 400
            total = sum((catalogo[i]['preco'] * q for i, q in normalizados), Decimal('0'))
            cliente_id = db.execute('INSERT INTO clientes(nome, telefone, endereco) VALUES (%s,%s,%s) RETURNING id', (cliente, telefone, endereco)).fetchone()['id']
            pedido_id = db.execute('INSERT INTO pedidos(cliente_id, status, total, observacao) VALUES (%s,%s,%s,%s) RETURNING id', (cliente_id, 'recebido', total, observacao)).fetchone()['id']
            with db.cursor() as cursor:
                cursor.executemany(
        """
        INSERT INTO itens_pedido
        (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES (%s, %s, %s, %s)
        """,
        [
            (pedido_id, i, q, catalogo[i]["preco"])
            for i, q in normalizados
        ]
    )
    return jsonify(id=pedido_id, total_centavos=centavos(total), status='recebido'), 201

def autorizado():
    token = os.getenv('BETA_ADMIN_TOKEN', '')
    fornecido = request.headers.get('X-Admin-Token', '')
    return bool(token) and hmac.compare_digest(token, fornecido)

@app.get('/admin')
def admin_page():
    return send_from_directory(BASE, 'admin.html')

@app.get('/api/admin/produtos')
def admin_produtos():
    if not autorizado():
        return jsonify(erro='Não autorizado'), 401
    with connection() as db:
        rows = db.execute('SELECT id, nome, descricao, preco, imagem, ativo FROM produtos ORDER BY id').fetchall()
    return jsonify([dict(p, preco_centavos=centavos(p['preco']), preco=str(p['preco'])) for p in rows])

@app.get('/api/admin/pedidos')
def listar_pedidos():
    if not autorizado():
        return jsonify(erro='Não autorizado'), 401
    with connection() as db:
        rows = db.execute('''SELECT p.id, p.status, p.total, p.observacao, p.criado_em,
                          c.nome AS cliente, c.telefone, c.endereco
                          FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
                          ORDER BY p.id DESC''').fetchall()
    return jsonify([dict(p, total=str(p['total']), criado_em=p['criado_em'].isoformat()) for p in rows])

@app.get('/api/admin/pedidos/<int:pedido_id>/itens')
def itens_do_pedido(pedido_id):
    if not autorizado():
        return jsonify(erro='Não autorizado'), 401
    with connection() as db:
        rows = db.execute('''SELECT i.quantidade, i.preco_unitario, pr.nome FROM itens_pedido i
          JOIN produtos pr ON pr.id=i.produto_id WHERE i.pedido_id=%s ORDER BY i.id''', (pedido_id,)).fetchall()
    return jsonify([dict(i, preco_unitario=str(i['preco_unitario'])) for i in rows])

@app.patch('/api/admin/pedidos/<int:pedido_id>')
def status_pedido(pedido_id):
    if not autorizado():
        return jsonify(erro='Não autorizado'), 401
    status = (request.get_json(silent=True) or {}).get('status')
    if status not in ('recebido', 'em_producao', 'pronto', 'entregue', 'cancelado'):
        return jsonify(erro='Status inválido'), 400
    with connection() as db:
        cur = db.execute('UPDATE pedidos SET status=%s WHERE id=%s', (status, pedido_id))
        db.commit()
    return (jsonify(ok=True), 200) if cur.rowcount else (jsonify(erro='Não encontrado'), 404)

@app.post('/api/admin/produtos')
def adicionar_produto():
    if not autorizado():
        return jsonify(erro='Não autorizado'), 401
    d = request.get_json(silent=True) or {}
    try:
        nome = str(d['nome']).strip()
        preco = Decimal(str(d['preco_centavos'])) / 100
        if not nome or len(nome) > 120 or not preco.is_finite() or preco <= 0:
            raise ValueError()
        with connection() as db:
            id_ = db.execute('INSERT INTO produtos(nome, descricao, preco, imagem, ativo) VALUES (%s,%s,%s,%s,TRUE) RETURNING id', (nome, str(d.get('descricao') or '')[:1000], preco, str(d.get('imagem') or '')[:250])).fetchone()['id']
            db.commit()
        return jsonify(id=id_), 201
    except (KeyError, TypeError, ValueError, InvalidOperation):
        return jsonify(erro='Produto inválido'), 400

@app.patch('/api/admin/produtos/<int:produto_id>')
def editar_produto(produto_id):
    if not autorizado():
        return jsonify(erro='Não autorizado'), 401
    d = request.get_json(silent=True) or {}
    try:
        nome = str(d['nome']).strip()
        preco = Decimal(str(d['preco_centavos'])) / 100
        ativo = d.get('ativo', True)
        if not nome or len(nome) > 120 or not preco.is_finite() or preco <= 0 or not isinstance(ativo, bool):
            raise ValueError()
        with connection() as db:
            cur = db.execute('UPDATE produtos SET nome=%s, preco=%s, ativo=%s WHERE id=%s', (nome, preco, ativo, produto_id))
            db.commit()
        return (jsonify(ok=True), 200) if cur.rowcount else (jsonify(erro='Não encontrado'), 404)
    except (KeyError, TypeError, ValueError, InvalidOperation):
        return jsonify(erro='Dados inválidos'), 400

if __name__ == '__main__':
    app.run(debug=False, port=int(os.getenv('PORT', '5000')))
