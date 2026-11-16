import type { Ano } from './tipos';
export const ano4: Ano = {
  "numero": 4,
  "titulo": "O Torneio das Bandeiras",
  "resumo": "CTF web entre Paranapiacaba, Pelotas e Juazeiro. Enzo vira aliado na defesa da loja, um infiltrado altera o placar e a Camada 4 revela o Projeto CHAVE MESTRA.",
  "capitulos": [
    {
      "id": "a4c01",
      "titulo": "O retorno",
      "mes": "Setembro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "narrador",
              "A neblina revela o Torneio das Bandeiras. Paranapiacaba recebe o Colégio Pampa Digital e a Academia do Sertão."
            ],
            [
              "iolanda",
              "Três escolas, provas éticas, nenhuma invasão fora do laboratório. Aqui a autorização não é opcional."
            ],
            [
              "enzo",
              "Que maravilha. Me colocaram na equipe de {nome}."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_1",
          "materia": "Artes da Web",
          "professor": "ruth",
          "titulo": "HTTP e métodos",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "ruth",
              "Hoje, http e métodos. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "HTTP é o protocolo de requisição e resposta entre cliente e servidor. GET consulta recursos, POST envia dados para processamento, PUT substitui um recurso e DELETE solicita remoção.",
            "O servidor responde com status, cabeçalhos e corpo. Não se deve usar GET para ações que alteram estado, pois links e caches podem acioná-lo sem intenção."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual método é normalmente seguro para consulta?",
              "opcoes": [
                "GET",
                "POST",
                "DELETE"
              ],
              "correta": 0,
              "explicacao": "GET foi projetado para recuperar recursos."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Método de leitura é ___.",
              "aceitos": [
                "GET"
              ],
              "explicacao": "A resposta é GET. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_2",
          "materia": "Artes da Web",
          "professor": "ruth",
          "titulo": "Códigos e cabeçalhos",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "ruth",
              "Hoje, códigos e cabeçalhos. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "Respostas HTTP 2xx representam sucesso, 3xx redirecionamento, 4xx problemas na requisição e 5xx problemas no servidor. 401 indica autenticação necessária ou inválida; 403 indica recusa.",
            "Content-Type informa o tipo de conteúdo retornado. Cache-Control orienta o cache; Set-Cookie solicita armazenamento de cookie pelo navegador."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que representa HTTP 404?",
              "opcoes": [
                "Recurso não encontrado",
                "Servidor comprometido",
                "Autenticação concluída"
              ],
              "correta": 0,
              "explicacao": "404 significa que o recurso solicitado não foi encontrado."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Código de acesso negado é ___.",
              "aceitos": [
                "403"
              ],
              "explicacao": "A resposta é 403. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 1: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'A neblina revela o Torneio das Band...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a4c02",
      "titulo": "Portas e segredos",
      "mes": "Outubro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "a4_lia",
              "A loja do torneio é fictícia. Compra real, pagamento real e cliente real ficam fora da competição."
            ],
            [
              "caua",
              "Ufa. Finalmente um carrinho que cabe no meu orçamento."
            ],
            [
              "tati",
              "A primeira flag está num cabeçalho. Quero evidência, não adivinhação."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_3",
          "materia": "Artes da Web",
          "professor": "otavio",
          "titulo": "Entender URLs",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "otavio",
              "Hoje, entender urls. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "URLs têm esquema, host, caminho e partes opcionais, como porta, consulta e fragmento. Em https://loja.example/item?id=3, o host é loja.example.",
            "O fragmento após # é tratado no navegador e normalmente não viaja na requisição HTTP. A presença de HTTPS não demonstra a honestidade do site."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual é o host de https://loja.example/item?x=1?",
              "opcoes": [
                "loja.example",
                "https",
                "x=1"
              ],
              "correta": 0,
              "explicacao": "Host identifica o destino da conexão."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Componente após ? é ___.",
              "aceitos": [
                "consulta"
              ],
              "explicacao": "A resposta é consulta. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_4",
          "materia": "Artes da Web",
          "professor": "otavio",
          "titulo": "HTML e JavaScript",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "otavio",
              "Hoje, html e javascript. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "HTML estrutura páginas com elementos como form, input, button e a. JavaScript manipula a interface e envia requisições, mas o usuário pode alterar o código executado no cliente.",
            "Validação de entrada e autorização devem ocorrer no servidor. Esconder botões com CSS ou JavaScript não impede acesso direto ao endpoint."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Onde deve ficar a validação de acesso?",
              "opcoes": [
                "No servidor",
                "Só no botão",
                "Só no CSS"
              ],
              "correta": 0,
              "explicacao": "A autorização precisa ser imposta pelo backend."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Linguagem de marcação é ___.",
              "aceitos": [
                "HTML"
              ],
              "explicacao": "A resposta é HTML. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 2: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'A loja do torneio é fictícia. Compr...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a4c03",
      "titulo": "As primeiras suspeitas",
      "mes": "Novembro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "enzo",
              "Achei que cookie fosse só aquele aviso que ninguém lê."
            ],
            [
              "heitor",
              "Sua sessão não é um biscoito. É uma identidade temporária que merece proteção."
            ],
            [
              "bia",
              "Meu goleiro também tem sessão: só entra quem está autorizado."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_5",
          "materia": "Artes da Web",
          "professor": "heitor",
          "titulo": "Cookies e sessões",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "heitor",
              "Hoje, cookies e sessões. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "Cookies guardam pequenos valores que o navegador devolve segundo regras de domínio e caminho. Uma sessão liga requisições distintas a um usuário autenticado.",
            "Secure exige canal HTTPS, HttpOnly impede leitura pelo JavaScript da página, e SameSite reduz envio em alguns contextos entre sites. Tokens de sessão devem ser imprevisíveis e renovados após login."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual atributo impede leitura do cookie pelo JS da página?",
              "opcoes": [
                "HttpOnly",
                "Secure",
                "Path"
              ],
              "correta": 0,
              "explicacao": "HttpOnly reduz roubo de sessão por scripts que tentam ler o cookie."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Atributo que exige HTTPS é ___.",
              "aceitos": [
                "Secure"
              ],
              "explicacao": "A resposta é Secure. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_6",
          "materia": "Artes da Web",
          "professor": "heitor",
          "titulo": "HTTPS e TLS",
          "atributo": "cripto",
          "lugar": "a4_arena",
          "abertura": [
            [
              "heitor",
              "Hoje, https e tls. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "HTTPS usa TLS para proteger confidencialidade e integridade dos dados em trânsito. Certificados ajudam o navegador a autenticar a identidade do servidor.",
            "TLS não corrige falhas de autorização, injeção ou aplicações fraudulentas. Nunca ignore alerta de certificado para facilitar o laboratório."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que HTTPS protege diretamente?",
              "opcoes": [
                "Transporte dos dados",
                "Permissões do banco",
                "Todas as vulnerabilidades web"
              ],
              "correta": 0,
              "explicacao": "TLS protege a conexão, não toda a aplicação."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Protocolo de proteção do HTTPS é ___.",
              "aceitos": [
                "TLS"
              ],
              "explicacao": "A resposta é TLS. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 3: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "duelo",
          "lugar": "a4_arena",
          "oponente": "enzo",
          "titulo": "Duelo no laboratório",
          "antes": [
            [
              "narrador",
              "Três rodadas técnicas. A precisão vale mais que gritar feitiços."
            ]
          ],
          "rodadas": [
            {
              "tipo": "multipla",
              "pergunta": "Que atitude respeita o trabalho de cibersegurança?",
              "opcoes": [
                "Trabalhar nos sistemas autorizados",
                "Invadir infraestrutura alheia"
              ],
              "correta": 0,
              "explicacao": "A prática técnica exige autorização."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Um registro de evento útil para investigação é um ___.",
              "aceitos": [
                "log"
              ],
              "explicacao": "Logs ajudam a reconstituir ocorrências."
            },
            {
              "tipo": "multipla",
              "pergunta": "Como confirmar se uma correção funcionou?",
              "opcoes": [
                "Testar e observar evidências",
                "Confiar no slide bonito"
              ],
              "correta": 0,
              "explicacao": "Validação técnica é essencial."
            }
          ],
          "vitoria": [
            [
              "tati",
              "Eu tenho a prova do acerto. E o backup da prova."
            ]
          ],
          "derrota": [
            [
              "caua",
              "Perdemos a rodada, não o conhecimento. Bora revisar."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Achei que cookie fosse só aquele av...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a4c04",
      "titulo": "A prova decisiva",
      "mes": "Dezembro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "narrador",
              "Primeira rodada do torneio. Você e Enzo descobrem uma consulta insegura no código autorizado."
            ],
            [
              "enzo",
              "Eu ia fazer no chute. Mas você provou onde está o erro e como corrigir."
            ],
            [
              "a4_davi",
              "A bandeira vale ponto; a correção bem explicada vale respeito."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_7",
          "materia": "Artes da Web",
          "professor": "nanda",
          "titulo": "OWASP Top 10",
          "atributo": "defesa",
          "lugar": "a4_arena",
          "abertura": [
            [
              "nanda",
              "Hoje, owasp top 10. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "OWASP Top 10 é uma referência educativa de riscos em aplicações web. Ela inclui falhas de acesso, injeção e configuração inadequada, mas não representa todas as vulnerabilidades possíveis.",
            "Antes de testar, defina um escopo escrito e um ambiente autorizado. O torneio usa aplicações fictícias, isoladas e sem informações de clientes reais."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual teste é ético?",
              "opcoes": [
                "O autorizado e documentado",
                "O que atinge qualquer site",
                "O que usa contas reais sem consentimento"
              ],
              "correta": 0,
              "explicacao": "O escopo vem antes da ferramenta."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Organização de segurança de aplicações é ___.",
              "aceitos": [
                "OWASP"
              ],
              "explicacao": "A resposta é OWASP. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_8",
          "materia": "Artes da Web",
          "professor": "otavio",
          "titulo": "SQL injection",
          "atributo": "ofensiva",
          "lugar": "a4_arena",
          "abertura": [
            [
              "otavio",
              "Hoje, sql injection. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "Uma injeção SQL acontece quando entrada de usuário é concatenada de modo inseguro na estrutura de uma consulta ao banco. O banco pode interpretar parte dessa entrada como comando.",
            "Consultas parametrizadas mantêm a instrução SQL separada dos valores. Use privilégios mínimos e não mostre erros internos do banco em páginas públicas."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual controle reduz SQL injection?",
              "opcoes": [
                "Consulta parametrizada",
                "Esconder menu",
                "Mudar a URL"
              ],
              "correta": 0,
              "explicacao": "Parâmetros impedem que valores sejam tratados como partes do comando."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Prática de separar valores de instruções é ___.",
              "aceitos": [
                "parametrização"
              ],
              "explicacao": "A resposta é parametrização. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 4: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Primeira rodada do torneio. Você e ...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a4c05",
      "titulo": "Uma pista na neblina",
      "mes": "Janeiro",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "narrador",
              "Na prova da loja, um comentário de teste aparece como marcação executável. O painel pausa o envio."
            ],
            [
              "nanda",
              "Texto de usuário tem de continuar texto. Browser não é palco para comando alheio."
            ],
            [
              "jonas",
              "Se comentário vira script, é porque esqueceram de botar limites no poema."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_9",
          "materia": "Artes da Web",
          "professor": "nanda",
          "titulo": "XSS e escape",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "nanda",
              "Hoje, xss e escape. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "XSS surge quando conteúdo controlado por alguém é interpretado como código ativo no navegador. Pode ser armazenado, refletido ou disparado por operações inseguras no DOM.",
            "Use codificação de saída apropriada ao contexto e APIs de texto seguras. Content Security Policy adiciona proteção, mas não substitui o tratamento correto da entrada e da saída."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual é a defesa fundamental para XSS?",
              "opcoes": [
                "Codificação contextual da saída",
                "Desligar backups",
                "Trocar IP"
              ],
              "correta": 0,
              "explicacao": "A saída precisa ser segura para o contexto onde será exibida."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Política de restrição de recursos do navegador é ___.",
              "aceitos": [
                "CSP"
              ],
              "explicacao": "A resposta é CSP. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_10",
          "materia": "Artes da Web",
          "professor": "heitor",
          "titulo": "CSRF",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "heitor",
              "Hoje, csrf. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "CSRF aproveita o fato de que o navegador pode enviar credenciais automaticamente a um serviço autenticado, mesmo quando a requisição foi induzida por outra página.",
            "Tokens anti-CSRF validados no servidor, controles de Origin e cookies SameSite ajudam a mitigar. Nunca use GET para alterar estado."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual proteção é indicada contra CSRF?",
              "opcoes": [
                "Token anti-CSRF",
                "CSS oculto",
                "Senha no HTML"
              ],
              "correta": 0,
              "explicacao": "Tokens ajudam a distinguir requisições legitimamente iniciadas."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Ataque de requisição forjada é ___.",
              "aceitos": [
                "CSRF"
              ],
              "explicacao": "A resposta é CSRF. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 5: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Na prova da loja, um comentário de ...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a4c06",
      "titulo": "Defesa de verdade",
      "mes": "Março",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "a4_lia",
              "Começa a defesa em tempo real. Cada equipe deve corrigir sua própria loja."
            ],
            [
              "enzo",
              "WAF não vai resolver uma autorização inexistente. Eu finalmente entendi."
            ],
            [
              "caua",
              "Vou colar isso na parede. É a primeira frase sensata do Enzo."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_11",
          "materia": "Artes da Web",
          "professor": "nanda",
          "titulo": "IDOR",
          "atributo": "web",
          "lugar": "a4_arena",
          "abertura": [
            [
              "nanda",
              "Hoje, idor. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "IDOR é uma falha de autorização: trocar o identificador de um objeto pode permitir acesso a um registro alheio quando o servidor não confere permissões.",
            "IDs aleatórios não substituem autorização no backend. Verifique acesso ao objeto e à operação em cada requisição, mesmo se o usuário estiver logado."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Como prevenir IDOR?",
              "opcoes": [
                "Verificar autorização de cada objeto",
                "Esconder o id",
                "Usar HTTPS apenas"
              ],
              "correta": 0,
              "explicacao": "Autenticação não implica acesso a todos os registros."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Verificação de permissão por objeto é ___.",
              "aceitos": [
                "autorização"
              ],
              "explicacao": "A resposta é autorização. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_12",
          "materia": "Artes da Web",
          "professor": "heitor",
          "titulo": "Hash de senhas",
          "atributo": "cripto",
          "lugar": "a4_arena",
          "abertura": [
            [
              "heitor",
              "Hoje, hash de senhas. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "Senhas não devem ficar em texto puro. Funções como Argon2id, scrypt ou bcrypt, com sal único, tornam mais caro testar listas de palpites após um vazamento.",
            "SHA-256 simples é rápido demais para proteger bancos de senhas sozinho. MFA, limitação de tentativas e monitoramento ajudam a proteger contas."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual função é indicada para senhas?",
              "opcoes": [
                "Argon2id com sal",
                "MD5 simples",
                "Base64"
              ],
              "correta": 0,
              "explicacao": "Argon2id é projetado para hash de senhas."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Valor aleatório associado ao hash é ___.",
              "aceitos": [
                "sal"
              ],
              "explicacao": "A resposta é sal. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 6: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'Começa a defesa em tempo real. Cada...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a4c07",
      "titulo": "O cerco",
      "mes": "Maio",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "narrador",
              "O placar recebe pontos que nenhuma escola conquistou. Há alterações administrativas fora do horário autorizado."
            ],
            [
              "tati",
              "Tenho os logs. Não houve prova nesse intervalo, houve mudança por uma credencial temporária."
            ],
            [
              "bia",
              "Suspende o placar. Investigar primeiro é melhor que acusar outra escola."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_13",
          "materia": "Artes da Web",
          "professor": "otavio",
          "titulo": "Upload seguro",
          "atributo": "defesa",
          "lugar": "a4_arena",
          "abertura": [
            [
              "otavio",
              "Hoje, upload seguro. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "Upload de arquivo pode trazer malware, esgotar armazenamento ou facilitar execução indevida. A extensão declarada pelo usuário não comprova o tipo real do arquivo.",
            "Valide tamanho e formato no servidor, renomeie o arquivo, guarde fora de área executável e aplique políticas de acesso e cabeçalhos adequados ao servir conteúdo."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Onde guardar uploads?",
              "opcoes": [
                "Fora de diretórios executáveis",
                "Junto ao código executável",
                "Em pasta pública sem controle"
              ],
              "correta": 0,
              "explicacao": "Armazenamento seguro ajuda a impedir execução indevida."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Processo de envio de arquivo é ___.",
              "aceitos": [
                "upload"
              ],
              "explicacao": "A resposta é upload. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_14",
          "materia": "Artes da Web",
          "professor": "nanda",
          "titulo": "WAF na prática",
          "atributo": "defesa",
          "lugar": "a4_arena",
          "abertura": [
            [
              "nanda",
              "Hoje, waf na prática. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "Um WAF analisa tráfego HTTP e bloqueia alguns comportamentos maliciosos. É uma camada complementar que não substitui corrigir a aplicação.",
            "Regras podem causar falsos positivos. Teste em observação, acompanhe os registros e valide mudanças com usuários legítimos."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "Qual limite do WAF?",
              "opcoes": [
                "Não substitui correção do código",
                "Elimina qualquer falha",
                "Não gera falsos positivos"
              ],
              "correta": 0,
              "explicacao": "WAF é mitigação adicional."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Firewall de aplicação web é ___.",
              "aceitos": [
                "WAF"
              ],
              "explicacao": "A resposta é WAF. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 7: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "duelo",
          "lugar": "a4_arena",
          "oponente": "enzo",
          "titulo": "Duelo do último alerta",
          "antes": [
            [
              "narrador",
              "Três rodadas técnicas. A precisão vale mais que gritar feitiços."
            ]
          ],
          "rodadas": [
            {
              "tipo": "multipla",
              "pergunta": "Que atitude respeita o trabalho de cibersegurança?",
              "opcoes": [
                "Trabalhar nos sistemas autorizados",
                "Invadir infraestrutura alheia"
              ],
              "correta": 0,
              "explicacao": "A prática técnica exige autorização."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Um registro de evento útil para investigação é um ___.",
              "aceitos": [
                "log"
              ],
              "explicacao": "Logs ajudam a reconstituir ocorrências."
            },
            {
              "tipo": "multipla",
              "pergunta": "Como confirmar se uma correção funcionou?",
              "opcoes": [
                "Testar e observar evidências",
                "Confiar no slide bonito"
              ],
              "correta": 0,
              "explicacao": "Validação técnica é essencial."
            }
          ],
          "vitoria": [
            [
              "tati",
              "Eu tenho a prova do acerto. E o backup da prova."
            ]
          ],
          "derrota": [
            [
              "caua",
              "Perdemos a rodada, não o conhecimento. Bora revisar."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "recompensa",
          "texto": "Missão 'O placar recebe pontos que nenhuma ...' concluída. Pomba Edite entrega os pontos e exige café.",
          "efeito": {
            "xp": 35,
            "atributos": {
              "defesa": 1
            }
          }
        }
      ]
    },
    {
      "id": "a4c08",
      "titulo": "O último capítulo",
      "mes": "Junho",
      "passos": [
        {
          "tipo": "cena",
          "lugar": "a4_arena",
          "falas": [
            [
              "narrador",
              "Os registros revelam um infiltrado usando uma conta provisória para tentar copiar credenciais das três escolas."
            ],
            [
              "nanda",
              "Revoguem as sessões, preservem as evidências e comuniquem as escolas pelo canal formal."
            ],
            [
              "enzo",
              "Eu estava errado sobre você. Obrigado por não deixar a gente culpar inocentes."
            ],
            [
              "nulo",
              "Você é igual à sua mãe."
            ],
            [
              "voce",
              "Então vou continuar o que ela começou."
            ]
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_15",
          "materia": "Artes da Web",
          "professor": "tati",
          "titulo": "Integridade do placar",
          "atributo": "forense",
          "lugar": "a4_arena",
          "abertura": [
            [
              "tati",
              "Hoje, integridade do placar. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "O placar do torneio precisa de trilha de auditoria que registre quem mudou pontuações e quando. Assinaturas e HMAC podem comprovar integridade e autenticidade em contextos apropriados.",
            "Preserve logs originais com horário em UTC, hashes e cadeia de custódia. Um registro suspeito não prova sozinho autoria humana; correlacione identidades e origem."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que ajuda a reconstruir alterações?",
              "opcoes": [
                "Logs e trilha de auditoria",
                "Cor da interface",
                "Palpite de um colega"
              ],
              "correta": 0,
              "explicacao": "Evidência contextualizada sustenta a investigação."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Fuso padrão em correlação é ___.",
              "aceitos": [
                "UTC"
              ],
              "explicacao": "A resposta é UTC. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "aula",
          "id": "a4_aula_16",
          "materia": "Artes da Web",
          "professor": "zuleica",
          "titulo": "Relatórios responsáveis",
          "atributo": "social",
          "lugar": "a4_arena",
          "abertura": [
            [
              "zuleica",
              "Hoje, relatórios responsáveis. Ficar encarando o dashboard não conta como investigar."
            ],
            [
              "tati",
              "Vou colocar isso na planilha. Sem macros, por enquanto."
            ]
          ],
          "explicacao": [
            "Um relatório de falha descreve escopo, ativo, impacto, evidências seguras, reprodução em ambiente controlado e orientação para correção.",
            "Divulgação coordenada evita expor pessoas ou credenciais. A vitória no torneio não justifica publicar dados nem comprometer a segurança das outras escolas."
          ],
          "exercicios": [
            {
              "tipo": "multipla",
              "pergunta": "O que incluir no relatório?",
              "opcoes": [
                "Impacto, evidências e correção",
                "Senhas copiadas",
                "Ataques fora do escopo"
              ],
              "correta": 0,
              "explicacao": "O objetivo é reparar e demonstrar o risco com cuidado."
            },
            {
              "tipo": "lacuna",
              "enunciado": "Complete o conceito: Comunicação responsável de falha é ___.",
              "aceitos": [
                "divulgação coordenada"
              ],
              "explicacao": "A resposta é divulgação coordenada. O conceito é importante para a defesa."
            },
            {
              "tipo": "ligar",
              "enunciado": "Associe a etapa à sua função no trabalho responsável.",
              "pares": [
                [
                  "Autorização",
                  "Define limites do trabalho"
                ],
                [
                  "Evidência",
                  "Sustenta o que foi observado"
                ],
                [
                  "Correção",
                  "Reduz a possibilidade de repetição"
                ],
                [
                  "Validação",
                  "Confirma que a medida funcionou"
                ]
              ],
              "explicacao": "Autorização, evidências, correção e validação formam uma prática responsável."
            },
            {
              "tipo": "multipla",
              "pergunta": "O que é correto ao descobrir uma falha?",
              "opcoes": [
                "Registrar evidências e comunicar pelo canal autorizado",
                "Publicar dados de terceiros",
                "Apagar logs para não preocupar a direção"
              ],
              "correta": 0,
              "explicacao": "A investigação deve preservar rastreabilidade e reduzir riscos."
            }
          ]
        },
        {
          "tipo": "desafio",
          "lugar": "a4_arena",
          "titulo": "Missão 8: decidir com evidências",
          "antes": [
            [
              "nanda",
              "Sem chute, sem espetáculo. A decisão certa evita um incidente maior."
            ]
          ],
          "exercicio": {
            "tipo": "multipla",
            "pergunta": "Qual é a primeira postura diante de um alerta ainda não confirmado?",
            "opcoes": [
              "Validar o alerta e preservar evidências",
              "Apagar todos os logs",
              "Divulgar dados pessoais dos envolvidos"
            ],
            "correta": 0,
            "explicacao": "Primeiro confirme os fatos; a resposta deve ser proporcional e rastreável."
          },
          "depois": [
            [
              "bia",
              "Isso. A defesa precisa de método, não de palestra motivacional."
            ]
          ],
          "atributo": "defesa"
        },
        {
          "tipo": "cena",
          "lugar": "cripta",
          "falas": [
            [
              "heitor",
              "A Camada 4 abriu. É um código-fonte incompleto, com o nome PROJETO CHAVE MESTRA."
            ],
            [
              "tati",
              "O arquivo cita credenciais e controladores de rede. Era isso que o infiltrado procurava."
            ],
            [
              "iolanda",
              "Ganhar ou empatar no torneio tem menos valor que preservar as pessoas. Parabéns pela escolha."
            ],
            [
              "voce",
              "O Nulo disse que sou igual à minha mãe. Talvez seja o melhor elogio possível."
            ]
          ]
        },
        {
          "tipo": "recompensa",
          "texto": "Camada 4 aberta: código-fonte incompleto do Projeto CHAVE MESTRA. A próxima pista espera no quinto ano.",
          "efeito": {
            "xp": 100,
            "item": "a4_fonte",
            "flag": "a4_camada4"
          }
        },
        {
          "tipo": "fimDeAno"
        }
      ]
    }
  ],
  "feiticos": [],
  "criaturas": [],
  "figurinhas": [],
  "itens": [
    {
      "id": "a4_fonte",
      "nome": "Fonte da CHAVE MESTRA",
      "descricao": "Código incompleto encontrado na Camada 4."
    }
  ],
  "lugares": [
    {
      "id": "a4_arena",
      "nome": "Arena das Bandeiras",
      "descricao": "O salão das três escolas e da competição ética.",
      "ano": 4,
      "cena": "castelo"
    }
  ],
  "personagens": [
    {
      "id": "a4_lia",
      "nome": "Lia Moraes",
      "papel": "organizadora do Torneio das Bandeiras e juíza do placar",
      "cor": "#f4a261",
      "pele": "#c68642",
      "cabelo": "#2b1a10",
      "estilo": "coque",
      "roupa": "#264653"
    },
    {
      "id": "a4_davi",
      "nome": "Davi Nogueira",
      "papel": "juiz técnico do Torneio das Bandeiras",
      "cor": "#8ab17d",
      "pele": "#8d5524",
      "cabelo": "#111",
      "estilo": "barba",
      "roupa": "#3d405b"
    }
  ]
};
